import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { comissoesStore, useComissoes } from "./comissoesStore";
import { CARGOS_MEMBRO_COMISSAO, LOCAIS_PUBLICACAO_ATO, SERVIDORES_CADASTRADOS, STATUS_COMISSAO, TIPOS_ATO_NOMEACAO, TIPOS_COMISSAO, iniciaisNome, orgaoDoServidor } from "./dominios";
import { ORGAOS_CERTAME } from "../certame/dominios";
import { certamesMock } from "../certame/mock";
import type { AtoNomeacaoMembro, ArquivoAtoNomeacao, CargoMembroComissao, Comissao, HistoricoAlteracaoMembro, LocalPublicacaoAto, MembroComissao, StatusComissao, TipoAtoNomeacao, TipoComissao, TipoEventoHistoricoMembro } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoFecharSeplag, BotaoIconSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { ModalSeplag } from "@componentes/Modal";
import { TabsSeplag } from "@componentes/Tabs";
import { DateFieldSeplag, DropdownFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import Base64FileModal from "@componentes/Base64FileModal";
import RotuloSeplag from "@componentes/Rotulo";
import { BlocoHeader } from "../certame/CertameFormContent";
import { arquivoDocumentoCertameValido, formatarTamanhoArquivo } from "../certame/DocumentosCertameTabela";
import { SEPLAG_YELLOW } from "../../../tokens/colors";
import "../certame/certame.css";
import "./comissoes.css";

const statusLabel:Record<StatusComissao,string> = Object.fromEntries(STATUS_COMISSAO.map((item) => [item.value, item.label])) as Record<StatusComissao,string>;
const cargoLabel:Record<CargoMembroComissao,string> = Object.fromEntries(CARGOS_MEMBRO_COMISSAO.map((item) => [item.value, item.label])) as Record<CargoMembroComissao,string>;
const statusEstilo:Record<StatusComissao,{ color:string; bg:string }> = {
 RASCUNHO: { color:"#55637a", bg:"#eef1f5" },
 EM_ANDAMENTO: { color:"#0b6199", bg:"#e9f3fc" },
 ENCERRADA: { color:"#147441", bg:"#e2f5e8" },
};
// Certame.tipoCertame ("PSS"/"CONCURSO_PUBLICO") não usa os mesmos valores de TipoComissao — a
// tela de Comissão só precisa listar, no campo "Concurso", os certames compatíveis com o tipo
// de comissão escolhido.
const TIPO_CERTAME_POR_TIPO_COMISSAO:Record<TipoComissao,string> = { PROCESSO_SELETIVO:"PSS", CONCURSO:"CONCURSO_PUBLICO" };

interface ComissaoFormValues {
 tipo:TipoComissao; certameId:string; nome:string; observacoes:string;
 previsaoInicio:string; inicio:string; previsaoTermino:string; termino:string;
 orgao:string; vinculoResponsavelId:string;
}

function valoresIniciais(comissao:Comissao | undefined):ComissaoFormValues {
 if (!comissao) return { tipo:"PROCESSO_SELETIVO", certameId:"", nome:"", observacoes:"", previsaoInicio:"", inicio:"", previsaoTermino:"", termino:"", orgao:"", vinculoResponsavelId:"" };
 return {
  tipo:comissao.tipo, certameId:comissao.certameId ?? "", nome:comissao.nome, observacoes:comissao.observacoes ?? "",
  previsaoInicio:comissao.previsaoInicio ?? "", inicio:comissao.inicio ?? "", previsaoTermino:comissao.previsaoTermino ?? "", termino:comissao.termino ?? "",
  orgao:comissao.orgao, vinculoResponsavelId:comissao.vinculoResponsavelId ?? "",
 };
}

// Busca de servidor reutilizada tanto no campo "Vínc. responsável" (Identificação) quanto na
// composição de membros — mesma experiência: sem termo digitado, nenhuma lista aparece; busca por
// nome, matrícula ou órgão (lotação); servidor escolhido vira um cartão compacto com opção de trocar.
function BuscaServidorCampo({ valor, onChange, excluirIds }:{ valor:string; onChange:(servidorId:string) => void; excluirIds?:readonly string[] }) {
 const [busca, setBusca] = useState("");
 const servidorSelecionado = valor ? SERVIDORES_CADASTRADOS.find((item) => item.id === valor) : undefined;
 const disponiveis = useMemo(() => {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  if (!termo) return [];
  const excluidos = new Set(excluirIds ?? []);
  return SERVIDORES_CADASTRADOS.filter((servidor) =>
   !excluidos.has(servidor.id) &&
   (servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) || servidor.matricula.includes(termo) || servidor.lotacao.toLocaleLowerCase("pt-BR").includes(termo)),
  );
 }, [busca, excluirIds]);

 if (servidorSelecionado) return <div className="prototype-comissoes-servidor-linha">
  <span className="prototype-comissoes-membro-iniciais" aria-hidden="true">{iniciaisNome(servidorSelecionado.nome)}</span>
  <div className="prototype-comissoes-membro-dados"><strong>{servidorSelecionado.nome}</strong><span>{servidorSelecionado.lotacao} · {servidorSelecionado.matricula}</span></div>
  <BotaoIconSeplag type="button" tooltip="Trocar servidor" icon="pi pi-times" onClick={() => onChange("")} />
 </div>;

 return <div className="prototype-comissoes-busca-servidor">
  <label className="prototype-native-field">
   <span>Servidor</span>
   <input type="text" value={busca} placeholder="Buscar por nome, matrícula ou órgão..." onChange={(event) => setBusca(event.target.value)} />
  </label>
  {busca.trim() && <div className="prototype-comissoes-servidor-lista">
   {disponiveis.length === 0
    ? <p className="prototype-comissoes-membros-empty">Nenhum servidor encontrado para "{busca}".</p>
    : disponiveis.map((servidor) => <button type="button" key={servidor.id} className="prototype-comissoes-servidor-linha" onClick={() => onChange(servidor.id)}>
     <span className="prototype-comissoes-membro-iniciais" aria-hidden="true">{iniciaisNome(servidor.nome)}</span>
     <div className="prototype-comissoes-membro-dados"><strong>{servidor.nome}</strong><span>{servidor.lotacao} · {servidor.matricula}</span></div>
    </button>)}
  </div>}
 </div>;
}

interface MembroFormValues {
 cargo:CargoMembroComissao; inicio:string; fim:string;
 tipoAto:TipoAtoNomeacao | ""; numeroAto:string; dataPublicacao:string; localPublicacao:LocalPublicacaoAto | "";
}
const membroValoresIniciais = ():MembroFormValues => ({ cargo:"MEMBRO", inicio:"", fim:"", tipoAto:"", numeroAto:"", dataPublicacao:"", localPublicacao:"" });

export function ComissaoFormContent() {
 const comissoes = useComissoes();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const [searchParams] = useSearchParams();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : comissoes.find((item) => item.id === id);
 const modoVisualizar = !modoNovo && searchParams.get("modo") === "visualizar";

 const { control, handleSubmit, watch, setValue } = useForm<ComissaoFormValues>({ defaultValues:valoresIniciais(existente) });
 const valores = watch();
 const [aba, setAba] = useState<"IDENTIFICACAO" | "COMPOSICAO">("IDENTIFICACAO");
 const [membros, setMembros] = useState<MembroComissao[]>(existente ? [...existente.membros] : []);
 // Histórico da composição (ver HistoricoMembrosComissaoModal) — como `membros`, fica só em memória
 // do formulário até "Salvar", quando é gravado junto com o resto (ver `salvar` abaixo).
 const [historicoMembros, setHistoricoMembros] = useState<HistoricoAlteracaoMembro[]>(existente ? [...existente.historicoMembros] : []);
 const [erro, setErro] = useState<string | null>(null);
 // Documento que institui a comissão (ex.: Portaria/Decreto de criação) — mesmo padrão de anexo
 // (.pdf, único arquivo) do Ato de nomeação de cada membro.
 const [arquivoComissaoPendente, setArquivoComissaoPendente] = useState<ArquivoAtoNomeacao | undefined>(existente?.arquivo);
 const [visualizarArquivoComissao, setVisualizarArquivoComissao] = useState(false);

 const opcoesConcurso = useMemo(() => certamesMock.filter((certame) => certame.tipoCertame === TIPO_CERTAME_POR_TIPO_COMISSAO[valores.tipo]).map((certame) => ({ label:certame.nomeEdital, value:certame.id })), [valores.tipo]);
 // Ao trocar o Tipo, um Concurso já selecionado de outro tipo deixa de ser uma opção válida.
 useEffect(() => {
  if (valores.certameId && !opcoesConcurso.some((item) => item.value === valores.certameId)) setValue("certameId", "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [valores.tipo]);

 // "Vínc. responsável" só lista servidores lotados no Órgão escolhido — sem Órgão definido ainda,
 // não há o que listar.
 const servidoresDoOrgao = useMemo(() => SERVIDORES_CADASTRADOS.filter((item) => orgaoDoServidor(item) === valores.orgao), [valores.orgao]);
 // Trocar o Órgão invalida um responsável já escolhido que não pertença mais a ele.
 useEffect(() => {
  if (valores.vinculoResponsavelId && !servidoresDoOrgao.some((item) => item.id === valores.vinculoResponsavelId)) setValue("vinculoResponsavelId", "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [valores.orgao]);

 // Número nunca é digitado — sequencial simples exibido só como referência (RotuloSeplag, campo fixo).
 const numeroForm = useMemo(() => existente?.numero ?? String(1000 + comissoes.length + 1), [existente, comissoes.length]);

 const salvar = handleSubmit((dados) => {
  if (modoVisualizar) return;
  setErro(null);
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const dadosComuns = {
   tipo:dados.tipo, certameId:dados.certameId || undefined, nome:dados.nome, observacoes:dados.observacoes || undefined,
   previsaoInicio:dados.previsaoInicio || undefined, inicio:dados.inicio || undefined, previsaoTermino:dados.previsaoTermino || undefined, termino:dados.termino || undefined,
   orgao:dados.orgao, vinculoResponsavelId:dados.vinculoResponsavelId || undefined, arquivo:arquivoComissaoPendente,
  };
  if (existente) {
   comissoesStore.update(existente.id, { ...dadosComuns, membros, historicoMembros, atualizadoEm:agora });
   navigate(`${BASE}/comissoes/${existente.id}`);
   return;
  }
  const novoId = `COM-${Date.now()}`;
  const nova:Comissao = { id:novoId, numero:numeroForm, ...dadosComuns, status:"RASCUNHO", membros, historicoMembros, criadoEm:agora, atualizadoEm:agora };
  comissoesStore.create(nova);
  navigate(`${BASE}/comissoes/${novoId}`);
 });

 // --- Modal "Adicionar/Editar membro" ---
 const [modalMembroAberto, setModalMembroAberto] = useState(false);
 const [membroEmEdicaoId, setMembroEmEdicaoId] = useState<string | null>(null);
 const [membroSomenteLeitura, setMembroSomenteLeitura] = useState(false);
 const [servidorSelecionadoId, setServidorSelecionadoId] = useState<string | null>(null);
 const [arquivoAtoPendente, setArquivoAtoPendente] = useState<ArquivoAtoNomeacao | undefined>(undefined);
 const [visualizarArquivoAto, setVisualizarArquivoAto] = useState(false);
 const membroForm = useForm<MembroFormValues>({ defaultValues:membroValoresIniciais() });
 const membroValores = membroForm.watch();

 // Servidores já designados nesta comissão (exceto o próprio membro em edição) não podem ser
 // escolhidos de novo na busca — evita duplicar a mesma pessoa na composição.
 const membrosJaAdicionadosIds = useMemo(() => membros.filter((item) => item.id !== membroEmEdicaoId).map((item) => item.servidorId), [membros, membroEmEdicaoId]);
 const servidorSelecionado = servidorSelecionadoId ? SERVIDORES_CADASTRADOS.find((item) => item.id === servidorSelecionadoId) : undefined;
 // Ato de nomeação (Tipo de ato, Número do ato, Data da publicação e Local da publicação) é
 // obrigatório para incluir o membro — é o instrumento legal que formaliza a designação.
 const atoNomeacaoValido = Boolean(membroValores.tipoAto && membroValores.numeroAto.trim() && membroValores.dataPublicacao && membroValores.localPublicacao);
 const podeConfirmarMembro = Boolean(servidorSelecionado) && atoNomeacaoValido;

 const abrirNovoMembro = () => {
  setErro(null);
  setMembroEmEdicaoId(null);
  setMembroSomenteLeitura(false);
  setServidorSelecionadoId(null);
  setArquivoAtoPendente(undefined);
  membroForm.reset(membroValoresIniciais());
  setModalMembroAberto(true);
 };
 const abrirMembroExistente = (membro:MembroComissao, somenteLeitura:boolean) => {
  setErro(null);
  setMembroEmEdicaoId(membro.id);
  setMembroSomenteLeitura(somenteLeitura);
  setServidorSelecionadoId(membro.servidorId);
  setArquivoAtoPendente(membro.atoNomeacao.arquivo);
  membroForm.reset({ cargo:membro.cargo, inicio:membro.inicio ?? "", fim:membro.fim ?? "", tipoAto:membro.atoNomeacao.tipoAto ?? "", numeroAto:membro.atoNomeacao.numeroAto ?? "", dataPublicacao:membro.atoNomeacao.dataPublicacao ?? "", localPublicacao:membro.atoNomeacao.localPublicacao ?? "" });
  setModalMembroAberto(true);
 };
 const editarMembro = (membro:MembroComissao) => abrirMembroExistente(membro, false);
 const visualizarMembro = (membro:MembroComissao) => abrirMembroExistente(membro, true);
 const fecharModalMembro = () => setModalMembroAberto(false);

 // Histórico da composição: registra um evento append-only por alteração real (nunca edita um
 // evento já gravado) — inclusão, troca de cargo e substituição do arquivo do ato de nomeação são
 // eventos distintos, e as duas últimas podem acontecer juntas na mesma confirmação do modal.
 const registrarEventosMembro = (membroSalvo:MembroComissao, membroAnterior:MembroComissao | undefined) => {
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const registradoEm = `${agora} ${new Date().toTimeString().slice(0, 5)}`;
  const eventos:HistoricoAlteracaoMembro[] = [];
  const criarEvento = (tipo:TipoEventoHistoricoMembro, descricao:string) => eventos.push({ id:`HIST-${Date.now()}-${eventos.length}`, membroId:membroSalvo.id, membroNome:membroSalvo.nome, tipo, descricao, registradoEm, usuario:CONTROLE_PSS_USUARIO_LOGADO });
  if (!membroAnterior) {
   criarEvento("MEMBRO_ADICIONADO", `Incluído na comissão como ${cargoLabel[membroSalvo.cargo]}.`);
  } else {
   if (membroAnterior.cargo !== membroSalvo.cargo) criarEvento("CARGO_ALTERADO", `Cargo alterado de ${cargoLabel[membroAnterior.cargo]} para ${cargoLabel[membroSalvo.cargo]}.`);
   const arquivoAnterior = membroAnterior.atoNomeacao.arquivo?.nome;
   const arquivoNovo = membroSalvo.atoNomeacao.arquivo?.nome;
   if (arquivoAnterior !== arquivoNovo) {
    if (!arquivoAnterior) criarEvento("ARQUIVO_ATO_ALTERADO", `Arquivo do ato de nomeação anexado (${arquivoNovo}).`);
    else if (!arquivoNovo) criarEvento("ARQUIVO_ATO_ALTERADO", `Arquivo do ato de nomeação removido (era ${arquivoAnterior}).`);
    else criarEvento("ARQUIVO_ATO_ALTERADO", `Arquivo do ato de nomeação substituído (${arquivoAnterior} → ${arquivoNovo}).`);
   }
  }
  if (eventos.length > 0) setHistoricoMembros((atuais) => [...atuais, ...eventos]);
 };

 const confirmarMembro = () => {
  const servidor = servidorSelecionado;
  if (!servidor) { setErro("Selecione um servidor para compor a comissão."); return; }
  if (!atoNomeacaoValido) { setErro("Preencha os campos obrigatórios do Ato de nomeação (Tipo de ato, Número do ato, Data da publicação e Local da publicação)."); return; }
  setErro(null);
  const dados = membroForm.getValues();
  const atoNomeacao:AtoNomeacaoMembro = { tipoAto:dados.tipoAto || undefined, numeroAto:dados.numeroAto || undefined, dataPublicacao:dados.dataPublicacao || undefined, localPublicacao:dados.localPublicacao || undefined, arquivo:arquivoAtoPendente };
  const membroSalvo:MembroComissao = { id:membroEmEdicaoId ?? `MBR-${Date.now()}`, servidorId:servidor.id, nome:servidor.nome, matricula:servidor.matricula, lotacao:servidor.lotacao, cargo:dados.cargo, inicio:dados.inicio || undefined, fim:dados.fim || undefined, atoNomeacao };
  registrarEventosMembro(membroSalvo, membroEmEdicaoId ? membros.find((item) => item.id === membroEmEdicaoId) : undefined);
  setMembros((atuais) => membroEmEdicaoId ? atuais.map((item) => item.id === membroEmEdicaoId ? membroSalvo : item) : [...atuais, membroSalvo]);
  setModalMembroAberto(false);
 };

 const [membroExcluirId, setMembroExcluirId] = useState<string | null>(null);
 const confirmarRemocaoMembro = () => {
  if (membroExcluirId) {
   const membroRemovido = membros.find((item) => item.id === membroExcluirId);
   if (membroRemovido) {
    const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
    setHistoricoMembros((atuais) => [...atuais, { id:`HIST-${Date.now()}`, membroId:membroRemovido.id, membroNome:membroRemovido.nome, tipo:"MEMBRO_REMOVIDO", descricao:`Removido da comissão (era ${cargoLabel[membroRemovido.cargo]}).`, registradoEm:`${agora} ${new Date().toTimeString().slice(0, 5)}`, usuario:CONTROLE_PSS_USUARIO_LOGADO }]);
   }
   setMembros((atuais) => atuais.filter((item) => item.id !== membroExcluirId));
  }
  setMembroExcluirId(null);
 };

 // Ato de nomeação tem uma única vaga de arquivo (o PDF do próprio ato) — anexar substitui o
 // arquivo anterior, mesmo padrão de validação (.pdf, até 2MB) do DocumentosCertameTabela.
 const onSelecionarArquivoAto = (event:React.ChangeEvent<HTMLInputElement>) => {
  const selecionado = event.target.files?.[0];
  event.target.value = "";
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) { setErro("Arquivo inválido: formato aceito .pdf, com até 2MB."); return; }
  setErro(null);
  const reader = new FileReader();
  reader.onload = () => {
   setArquivoAtoPendente({ id:`ARQ-${Date.now()}`, nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size });
  };
  reader.readAsDataURL(selecionado);
 };

 // Histórico: registra a troca do documento único da comissão (aba Identificação) — mesma ideia de
 // registrarEventosMembro, mas sem membro associado (ver DOCUMENTO_COMISSAO_ALTERADO em types.ts).
 const registrarEventoDocumentoComissao = (descricao:string) => {
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  setHistoricoMembros((atuais) => [...atuais, { id:`HIST-${Date.now()}`, tipo:"DOCUMENTO_COMISSAO_ALTERADO", descricao, registradoEm:`${agora} ${new Date().toTimeString().slice(0, 5)}`, usuario:CONTROLE_PSS_USUARIO_LOGADO }]);
 };

 // Documento da comissão tem uma única vaga de arquivo — anexar substitui o arquivo anterior,
 // mesmo padrão de validação (.pdf, até 2MB) do Ato de nomeação.
 const onSelecionarArquivoComissao = (event:React.ChangeEvent<HTMLInputElement>) => {
  const selecionado = event.target.files?.[0];
  event.target.value = "";
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) { setErro("Arquivo inválido: formato aceito .pdf, com até 2MB."); return; }
  setErro(null);
  const arquivoAnterior = arquivoComissaoPendente?.nome;
  const reader = new FileReader();
  reader.onload = () => {
   setArquivoComissaoPendente({ id:`ARQ-${Date.now()}`, nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size });
   registrarEventoDocumentoComissao(arquivoAnterior ? `Documento da comissão substituído (${arquivoAnterior} → ${selecionado.name}).` : `Documento da comissão anexado (${selecionado.name}).`);
  };
  reader.readAsDataURL(selecionado);
 };

 const removerArquivoComissao = () => {
  if (arquivoComissaoPendente) registrarEventoDocumentoComissao(`Documento da comissão removido (era ${arquivoComissaoPendente.nome}).`);
  setArquivoComissaoPendente(undefined);
 };

 const voltar = () => navigate(`${BASE}/comissoes`);

 return <div className="prototype-page-content prototype-page-content--white prototype-certame-form-page">
  <form onSubmit={salvar}>
   <CardSeplag
    title={modoNovo ? "Nova comissão" : `${existente?.numero} — ${existente?.nome}`}
    actions={existente ? <div className="flex align-items-center gap-2">
     {modoVisualizar && <BadgeSeplag label="Somente leitura" color="#55637a" bg="#eef1f5" border="transparent" size="md" />}
     <BadgeSeplag label={statusLabel[existente.status]} color={statusEstilo[existente.status].color} bg={statusEstilo[existente.status].bg} border="transparent" size="md" />
    </div> : undefined}
    footer={<div className="col-12 flex justify-content-end align-items-center gap-2">
     <BotaoVoltarSeplag type="button" onClick={voltar} />
     {!modoVisualizar && aba === "IDENTIFICACAO" && <BotaoSalvarSeplag type="submit" label="Salvar comissão" />}
     {!modoVisualizar && aba === "COMPOSICAO" && <BotaoSalvarSeplag type="submit" label="Finalizar cadastro" />}
    </div>}
   >
    {erro && <div className="col-12"><p className="prototype-comissoes-erro">{erro}</p></div>}

    <TabsSeplag<"IDENTIFICACAO" | "COMPOSICAO">
     items={[{ id:"IDENTIFICACAO", label:"Identificação", value:"IDENTIFICACAO" }, { id:"COMPOSICAO", label:`Composição da comissão (${membros.length})`, value:"COMPOSICAO" }]}
     activeValue={aba}
     onChange={setAba}
     equalWidth
     className="prototype-certame-tabs"
    />

    {aba === "IDENTIFICACAO" && <div className="col-12">
     <div className="prototype-certame-bloco">
      <BlocoHeader icone="pi-id-card" titulo="Identificação" subtitulo="Dados que identificam a comissão no sistema." />
      <div className="grid">
       <RotuloSeplag nome="Código" cols="12 6 4"><div className="prototype-certame-campo-fixo-valor">{numeroForm}</div></RotuloSeplag>
       <DropdownFieldSeplag name="tipo" control={control} label="Tipo" required cols="12 6 4" options={TIPOS_COMISSAO} optionLabel="label" optionValue="value" showClear={false} disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <DropdownFieldSeplag name="certameId" control={control} label="Edital" cols="12 6 4" options={opcoesConcurso} optionLabel="label" optionValue="value" placeholder="Nenhum edital vinculado" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <TextFieldSeplag name="nome" control={control} label="Nome da Comissão" required cols="12" placeholder="Nome da comissão" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <TextAreaFieldSeplag name="observacoes" control={control} label="Observações" cols="12" disabled={modoVisualizar} getFormErrorMessage={() => null} />
      </div>
     </div>

     <div className="prototype-certame-bloco">
      <BlocoHeader icone="pi-calendar" titulo="Vigência" subtitulo="Prazos previstos e datas efetivas de funcionamento." />
      <div className="grid">
       <DateFieldSeplag name="previsaoInicio" control={control} label="Previsão início" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <DateFieldSeplag name="inicio" control={control} label="Início" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <DateFieldSeplag name="previsaoTermino" control={control} label="Previsão término" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <DateFieldSeplag name="termino" control={control} label="Término" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
      </div>
     </div>

     <div className="prototype-certame-bloco">
      <BlocoHeader icone="pi-building" titulo="Responsabilidade" subtitulo="Unidades e servidor responsáveis pela comissão." />
      <div className="grid">
       <DropdownFieldSeplag name="orgao" control={control} label="Órgão do Servidor Responsável" required cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} disabled={modoVisualizar} getFormErrorMessage={() => null} />
       <DropdownFieldSeplag name="vinculoResponsavelId" control={control} label="Servidor responsável" cols="12 6" options={servidoresDoOrgao.map((item) => ({ label:item.nome, value:item.id, matricula:item.matricula }))} optionLabel="label" optionValue="value" filterBy="label,matricula" itemTemplate={(option) => <span>{option.matricula} — {option.label}</span>} placeholder={valores.orgao ? "Selecione o servidor responsável" : "Selecione o Órgão primeiro"} disabled={modoVisualizar || !valores.orgao} getFormErrorMessage={() => null} />
      </div>
     </div>

     <div className="prototype-certame-bloco">
      <BlocoHeader icone="pi-paperclip" titulo="Documento" subtitulo="Ato de criação da comissão (portaria, decreto ou resolução)." />
      <div className="prototype-efetivo-exercicio-table-wrap">
      <table className="prototype-simple-table prototype-comissoes-arquivo-table">
       <thead><tr><th>Arquivo anexado</th><th>Tamanho</th><th>Ações</th></tr></thead>
       <tbody>
        <tr>
         <td>{arquivoComissaoPendente?.nome ?? "Nenhum arquivo anexado"}</td>
         <td>{arquivoComissaoPendente ? formatarTamanhoArquivo(arquivoComissaoPendente.tamanho) : "—"}</td>
         <td>
          <input id="comissao-arquivo-upload" type="file" accept="application/pdf" style={{ display:"none" }} onChange={onSelecionarArquivoComissao} />
          <div className="flex gap-2 justify-content-end">
           {!modoVisualizar && <BotaoIconSeplag type="button" icon="pi pi-cloud-upload" tooltip={arquivoComissaoPendente ? "Substituir arquivo" : "Anexar arquivo"} onClick={() => document.getElementById("comissao-arquivo-upload")?.click()} />}
           <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar arquivo" disabled={!arquivoComissaoPendente} onClick={() => setVisualizarArquivoComissao(true)} />
           {!modoVisualizar && <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip="Remover arquivo" disabled={!arquivoComissaoPendente} onClick={removerArquivoComissao} />}
          </div>
         </td>
        </tr>
       </tbody>
      </table>
      </div>
     </div>
    </div>}

    {aba === "COMPOSICAO" && <div className="col-12">
     <div className="prototype-certame-bloco">
      <div className="prototype-comissoes-membros-head">
       <BlocoHeader icone="pi-users" titulo="Composição da comissão" subtitulo={`${membros.length} membro${membros.length === 1 ? "" : "s"} designado${membros.length === 1 ? "" : "s"}.`} />
       {!modoVisualizar && <BotaoAdicionarSeplag type="button" label="Adicionar membro" onClick={abrirNovoMembro} />}
      </div>
      {membros.length === 0
       ? <p className="prototype-comissoes-membros-empty">Nenhum membro designado. Use Adicionar membro para nomear.</p>
       : <div className="prototype-comissoes-membros-lista">
        {membros.map((membro) => <div key={membro.id} className="prototype-comissoes-membro-linha">
         <span className="prototype-comissoes-membro-iniciais" aria-hidden="true">{iniciaisNome(membro.nome)}</span>
         <div className="prototype-comissoes-membro-dados">
          <strong>{membro.nome}</strong>
          <span>{cargoLabel[membro.cargo]} · {membro.matricula}</span>
         </div>
         <div className="flex gap-2">
          <BotaoIconSeplag type="button" tooltip="Visualizar" icon="pi pi-eye" onClick={() => visualizarMembro(membro)} />
          {!modoVisualizar && <BotaoIconSeplag type="button" tooltip="Editar" icon="pi pi-pencil" style={{ backgroundColor:SEPLAG_YELLOW, borderColor:SEPLAG_YELLOW }} onClick={() => editarMembro(membro)} />}
          {!modoVisualizar && <BotaoIconSeplag type="button" severity="danger" tooltip="Excluir" icon="pi pi-trash" onClick={() => setMembroExcluirId(membro.id)} />}
         </div>
        </div>)}
       </div>}
     </div>
    </div>}
   </CardSeplag>
  </form>

  <ModalSeplag
   visible={modalMembroAberto}
   titulo={<div className="prototype-comissoes-modal-titulo">
    <strong>{membroSomenteLeitura ? "Visualizar membro da comissão" : membroEmEdicaoId ? "Editar membro da comissão" : "Adicionar membro à comissão"}</strong>
    <span>{membroSomenteLeitura ? "Detalhes do servidor e do ato de nomeação." : "Selecione o servidor e informe o ato de nomeação."}</span>
   </div>}
   fechar={fecharModalMembro}
   tamanho="960px"
   closeOnEscape
   customFooter={membroSomenteLeitura
    ? <div className="flex justify-content-end gap-2">
      <BotaoFecharSeplag type="button" label="Fechar" icon="pi pi-times" onClick={fecharModalMembro} />
     </div>
    : <div className="flex justify-content-end gap-2">
      <BotaoFecharSeplag type="button" label="Cancelar" icon="pi pi-times" onClick={fecharModalMembro} />
      <BotaoAdicionarSeplag type="button" label={membroEmEdicaoId ? "Salvar" : "Adicionar"} icon="pi pi-check" disabled={!podeConfirmarMembro} onClick={confirmarMembro} />
     </div>}
  >
   <div className="col-12 prototype-comissoes-membro-form">
    {erro && <p className="prototype-comissoes-erro">{erro}</p>}

    <section>
     <small className="prototype-comissoes-kicker">Vínculo</small>
     {membroEmEdicaoId
      ? <div className="prototype-comissoes-servidor-linha prototype-comissoes-servidor-fixo">
        <span className="prototype-comissoes-membro-iniciais" aria-hidden="true">{servidorSelecionado ? iniciaisNome(servidorSelecionado.nome) : ""}</span>
        <div className="prototype-comissoes-membro-dados"><strong>{servidorSelecionado?.nome}</strong><span>{servidorSelecionado?.lotacao} · {servidorSelecionado?.matricula}</span></div>
       </div>
      : <>
        <BuscaServidorCampo valor={servidorSelecionadoId ?? ""} onChange={(id) => setServidorSelecionadoId(id || null)} excluirIds={membrosJaAdicionadosIds} />
        {!servidorSelecionado && <small className="p-error">Selecione um servidor.</small>}
       </>}
     <div className="grid">
      <DropdownFieldSeplag name="cargo" control={membroForm.control} label="Cargo na comissão" required cols="12 4" options={CARGOS_MEMBRO_COMISSAO} optionLabel="label" optionValue="value" showClear={false} disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
      <DateFieldSeplag name="inicio" control={membroForm.control} label="Início" cols="12 4" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
      <DateFieldSeplag name="fim" control={membroForm.control} label="Fim" cols="12 4" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
     </div>
    </section>

    <section>
     <small className="prototype-comissoes-kicker">Ato de nomeação</small>
     <div className="grid">
      <DropdownFieldSeplag name="tipoAto" control={membroForm.control} label="Tipo de ato" required cols="12 6 3" options={TIPOS_ATO_NOMEACAO} optionLabel="label" optionValue="value" placeholder="Selecione" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
      <TextFieldSeplag name="numeroAto" control={membroForm.control} label="Número do ato" required cols="12 6 3" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
      <DateFieldSeplag name="dataPublicacao" control={membroForm.control} label="Data da publicação" required cols="12 6 3" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
      <DropdownFieldSeplag name="localPublicacao" control={membroForm.control} label="Local da publicação" required cols="12 6 3" options={LOCAIS_PUBLICACAO_ATO} optionLabel="label" optionValue="value" placeholder="Selecione" disabled={membroSomenteLeitura} getFormErrorMessage={() => null} />
     </div>
    </section>

    <section>
     <small className="prototype-comissoes-kicker">Arquivos</small>
     <div className="prototype-efetivo-exercicio-table-wrap">
     <table className="prototype-simple-table prototype-comissoes-arquivo-table">
      <thead><tr><th>Arquivo anexado</th><th>Tamanho</th><th>Ações</th></tr></thead>
      <tbody>
       <tr>
        <td>{arquivoAtoPendente?.nome ?? "Nenhum arquivo anexado"}</td>
        <td>{arquivoAtoPendente ? formatarTamanhoArquivo(arquivoAtoPendente.tamanho) : "—"}</td>
        <td>
         <input id="comissao-membro-ato-upload" type="file" accept="application/pdf" style={{ display:"none" }} onChange={onSelecionarArquivoAto} />
         <div className="flex gap-2 justify-content-end">
          {!membroSomenteLeitura && <BotaoIconSeplag type="button" icon="pi pi-cloud-upload" tooltip={arquivoAtoPendente ? "Substituir arquivo" : "Anexar arquivo"} onClick={() => document.getElementById("comissao-membro-ato-upload")?.click()} />}
          <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar arquivo" disabled={!arquivoAtoPendente} onClick={() => setVisualizarArquivoAto(true)} />
          {!membroSomenteLeitura && <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip="Remover arquivo" disabled={!arquivoAtoPendente} onClick={() => setArquivoAtoPendente(undefined)} />}
         </div>
        </td>
       </tr>
      </tbody>
     </table>
     </div>
    </section>
   </div>
  </ModalSeplag>

  <Base64FileModal
   visible={visualizarArquivoAto}
   onHide={() => setVisualizarArquivoAto(false)}
   base64={arquivoAtoPendente?.conteudoEmBase64 ?? null}
   mimeType="application/pdf"
   fileName={arquivoAtoPendente?.nome}
   header={arquivoAtoPendente?.nome}
  />

  <Base64FileModal
   visible={visualizarArquivoComissao}
   onHide={() => setVisualizarArquivoComissao(false)}
   base64={arquivoComissaoPendente?.conteudoEmBase64 ?? null}
   mimeType="application/pdf"
   fileName={arquivoComissaoPendente?.nome}
   header={arquivoComissaoPendente?.nome}
  />

  <ModalSeplag
   visible={membroExcluirId !== null}
   titulo="Excluir membro"
   fechar={() => setMembroExcluirId(null)}
   tamanho="480px"
   closeOnEscape
   customFooter={<div className="flex justify-content-end gap-2">
    <BotaoSeplag type="button" label="Cancelar" outlined onClick={() => setMembroExcluirId(null)} />
    <BotaoSeplag type="button" label="Excluir" severity="danger" onClick={confirmarRemocaoMembro} />
   </div>}
  >
   <p className="col-12">Deseja realmente remover este membro da comissão?</p>
  </ModalSeplag>
 </div>;
}
