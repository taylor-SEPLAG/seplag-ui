import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA } from "../constants";
import { comissoesStore, useComissoes } from "./comissoesStore";
import { CARGOS_MEMBRO_COMISSAO, LOCAIS_PUBLICACAO_ATO, SERVIDORES_CADASTRADOS, STATUS_COMISSAO, TIPOS_ATO_NOMEACAO, TIPOS_COMISSAO, iniciaisNome } from "./dominios";
import { ORGAOS_CERTAME } from "../certame/dominios";
import { certamesMock } from "../certame/mock";
import type { AtoNomeacaoMembro, ArquivoAtoNomeacao, CargoMembroComissao, Comissao, LocalPublicacaoAto, MembroComissao, StatusComissao, TipoAtoNomeacao, TipoComissao } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoFecharSeplag, BotaoIconSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { ModalSeplag } from "@componentes/Modal";
import { TabsSeplag } from "@componentes/Tabs";
import { DateFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import Base64FileModal from "@componentes/Base64FileModal";
import RotuloSeplag from "@componentes/Rotulo";
import "./comissoes.css";

function BlocoHeader({ icone, titulo, subtitulo }:{ icone:string; titulo:string; subtitulo:string }) {
 return <header className="prototype-comissoes-bloco-header">
  <span className={`prototype-comissoes-bloco-icone pi ${icone}`} aria-hidden="true" />
  <div><h3>{titulo}</h3><p>{subtitulo}</p></div>
 </header>;
}

const tipoLabel:Record<TipoComissao,string> = Object.fromEntries(TIPOS_COMISSAO.map((item) => [item.value, item.label])) as Record<TipoComissao,string>;
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
 tipo:TipoComissao; certameId:string; nome:string; finalidade:string; observacoes:string;
 previsaoInicio:string; inicio:string; previsaoTermino:string; termino:string;
 orgao:string; vinculoResponsavelId:string;
}

function valoresIniciais(comissao:Comissao | undefined):ComissaoFormValues {
 if (!comissao) return { tipo:"PROCESSO_SELETIVO", certameId:"", nome:"", finalidade:"", observacoes:"", previsaoInicio:"", inicio:"", previsaoTermino:"", termino:"", orgao:"", vinculoResponsavelId:"" };
 return {
  tipo:comissao.tipo, certameId:comissao.certameId ?? "", nome:comissao.nome, finalidade:comissao.finalidade ?? "", observacoes:comissao.observacoes ?? "",
  previsaoInicio:comissao.previsaoInicio ?? "", inicio:comissao.inicio ?? "", previsaoTermino:comissao.previsaoTermino ?? "", termino:comissao.termino ?? "",
  orgao:comissao.orgao, vinculoResponsavelId:comissao.vinculoResponsavelId ?? "",
 };
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
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : comissoes.find((item) => item.id === id);

 const { control, handleSubmit, watch, setValue } = useForm<ComissaoFormValues>({ defaultValues:valoresIniciais(existente) });
 const valores = watch();
 const [aba, setAba] = useState<"IDENTIFICACAO" | "COMPOSICAO">("IDENTIFICACAO");
 const [membros, setMembros] = useState<MembroComissao[]>(existente ? [...existente.membros] : []);
 const [erro, setErro] = useState<string | null>(null);

 const opcoesConcurso = useMemo(() => certamesMock.filter((certame) => certame.tipoCertame === TIPO_CERTAME_POR_TIPO_COMISSAO[valores.tipo]).map((certame) => ({ label:certame.nomeEdital, value:certame.id })), [valores.tipo]);
 // Ao trocar o Tipo, um Concurso já selecionado de outro tipo deixa de ser uma opção válida.
 useEffect(() => {
  if (valores.certameId && !opcoesConcurso.some((item) => item.value === valores.certameId)) setValue("certameId", "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [valores.tipo]);

 const finalHint = !valores.nome && valores.certameId ? `Sugestão: Comissão de ${tipoLabel[valores.tipo]} — ${certamesMock.find((item) => item.id === valores.certameId)?.nomeEdital ?? ""}` : undefined;
 const responsavelSelecionado = SERVIDORES_CADASTRADOS.find((item) => item.id === valores.vinculoResponsavelId);
 // Número nunca é digitado — sequencial simples exibido só como referência (RotuloSeplag, campo fixo).
 const numeroForm = useMemo(() => existente?.numero ?? String(1000 + comissoes.length + 1), [existente, comissoes.length]);

 const salvar = handleSubmit((dados) => {
  setErro(null);
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const dadosComuns = {
   tipo:dados.tipo, certameId:dados.certameId || undefined, nome:dados.nome, finalidade:dados.finalidade || undefined, observacoes:dados.observacoes || undefined,
   previsaoInicio:dados.previsaoInicio || undefined, inicio:dados.inicio || undefined, previsaoTermino:dados.previsaoTermino || undefined, termino:dados.termino || undefined,
   orgao:dados.orgao, vinculoResponsavelId:dados.vinculoResponsavelId || undefined,
  };
  if (existente) {
   comissoesStore.update(existente.id, { ...dadosComuns, membros, atualizadoEm:agora });
   navigate(`${BASE}/comissoes/${existente.id}`);
   return;
  }
  const novoId = `COM-${Date.now()}`;
  const nova:Comissao = { id:novoId, numero:numeroForm, ...dadosComuns, status:"RASCUNHO", membros, criadoEm:agora, atualizadoEm:agora };
  comissoesStore.create(nova);
  navigate(`${BASE}/comissoes/${novoId}`);
 });

 // --- Modal "Adicionar/Editar membro" ---
 const [modalMembroAberto, setModalMembroAberto] = useState(false);
 const [membroEmEdicaoId, setMembroEmEdicaoId] = useState<string | null>(null);
 const [servidorSelecionadoId, setServidorSelecionadoId] = useState<string | null>(null);
 const [buscaServidor, setBuscaServidor] = useState("");
 const [arquivosAtoPendentes, setArquivosAtoPendentes] = useState<ArquivoAtoNomeacao[]>([]);
 const [arquivoVisualizando, setArquivoVisualizando] = useState<ArquivoAtoNomeacao | null>(null);
 const membroForm = useForm<MembroFormValues>({ defaultValues:membroValoresIniciais() });
 const membroValores = membroForm.watch();

 const servidoresDisponiveis = useMemo(() => {
  const jaAdicionados = new Set(membros.filter((item) => item.id !== membroEmEdicaoId).map((item) => item.servidorId));
  const termo = buscaServidor.trim().toLocaleLowerCase("pt-BR");
  return SERVIDORES_CADASTRADOS.filter((servidor) =>
   !jaAdicionados.has(servidor.id) &&
   (!termo || servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) || servidor.matricula.includes(termo)),
  );
 }, [membros, membroEmEdicaoId, buscaServidor]);
 const servidorSelecionado = servidorSelecionadoId ? SERVIDORES_CADASTRADOS.find((item) => item.id === servidorSelecionadoId) : undefined;

 const abrirNovoMembro = () => {
  setErro(null);
  setMembroEmEdicaoId(null);
  setServidorSelecionadoId(null);
  setBuscaServidor("");
  setArquivosAtoPendentes([]);
  membroForm.reset(membroValoresIniciais());
  setModalMembroAberto(true);
 };
 const editarMembro = (membro:MembroComissao) => {
  setErro(null);
  setMembroEmEdicaoId(membro.id);
  setServidorSelecionadoId(membro.servidorId);
  setBuscaServidor("");
  setArquivosAtoPendentes([...membro.atoNomeacao.arquivos]);
  membroForm.reset({ cargo:membro.cargo, inicio:membro.inicio ?? "", fim:membro.fim ?? "", tipoAto:membro.atoNomeacao.tipoAto ?? "", numeroAto:membro.atoNomeacao.numeroAto ?? "", dataPublicacao:membro.atoNomeacao.dataPublicacao ?? "", localPublicacao:membro.atoNomeacao.localPublicacao ?? "" });
  setModalMembroAberto(true);
 };
 const fecharModalMembro = () => setModalMembroAberto(false);

 const confirmarMembro = () => {
  const servidor = servidorSelecionado;
  if (!servidor) { setErro("Selecione um servidor para compor a comissão."); return; }
  const dados = membroForm.getValues();
  const atoNomeacao:AtoNomeacaoMembro = { tipoAto:dados.tipoAto || undefined, numeroAto:dados.numeroAto || undefined, dataPublicacao:dados.dataPublicacao || undefined, localPublicacao:dados.localPublicacao || undefined, arquivos:arquivosAtoPendentes };
  const membroSalvo:MembroComissao = { id:membroEmEdicaoId ?? `MBR-${Date.now()}`, servidorId:servidor.id, nome:servidor.nome, matricula:servidor.matricula, lotacao:servidor.lotacao, cargo:dados.cargo, inicio:dados.inicio || undefined, fim:dados.fim || undefined, atoNomeacao };
  setMembros((atuais) => membroEmEdicaoId ? atuais.map((item) => item.id === membroEmEdicaoId ? membroSalvo : item) : [...atuais, membroSalvo]);
  setModalMembroAberto(false);
 };

 const [membroExcluirId, setMembroExcluirId] = useState<string | null>(null);
 const confirmarRemocaoMembro = () => { if (membroExcluirId) setMembros((atuais) => atuais.filter((item) => item.id !== membroExcluirId)); setMembroExcluirId(null); };

 const onUploadArquivoAto = (event:{ files?:File[] }) => {
  const selecionado = event.files?.[0];
  if (!selecionado) return;
  const reader = new FileReader();
  reader.onload = () => {
   setArquivosAtoPendentes((atuais) => [...atuais, { id:`ARQ-${Date.now()}`, nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size }]);
  };
  reader.readAsDataURL(selecionado);
 };
 const arquivosAtoParaExibicao:ArquivoAnexadoSeplag[] = arquivosAtoPendentes.map((arquivo) => ({ nome:arquivo.nome, extensao:arquivo.extensao, contentType:arquivo.contentType, conteudoEmBase64:arquivo.conteudoEmBase64, tamanho:arquivo.tamanho }));

 const voltar = () => navigate(`${BASE}/comissoes`);

 return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page">
  <form onSubmit={salvar}>
   <CardSeplag
    title={modoNovo ? "Nova comissão" : `${existente?.numero} — ${existente?.nome}`}
    actions={existente ? <BadgeSeplag label={statusLabel[existente.status]} color={statusEstilo[existente.status].color} bg={statusEstilo[existente.status].bg} border="transparent" size="md" /> : undefined}
    footer={<div className="col-12 flex justify-content-end align-items-center gap-2">
     <BotaoVoltarSeplag type="button" onClick={voltar} />
     {aba === "IDENTIFICACAO" && <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" onClick={() => setAba("COMPOSICAO")} />}
     {aba === "IDENTIFICACAO" && <BotaoSalvarSeplag type="submit" label="Salvar comissão" />}
     {aba === "COMPOSICAO" && <BotaoSalvarSeplag type="submit" label="Finalizar cadastro" />}
    </div>}
   >
    {erro && <div className="col-12"><p className="prototype-comissoes-erro">{erro}</p></div>}

    <TabsSeplag<"IDENTIFICACAO" | "COMPOSICAO">
     items={[{ id:"IDENTIFICACAO", label:"Identificação", value:"IDENTIFICACAO" }, { id:"COMPOSICAO", label:`Composição da comissão (${membros.length})`, value:"COMPOSICAO" }]}
     activeValue={aba}
     onChange={setAba}
     equalWidth
     className="prototype-comissoes-tabs"
    />

    {aba === "IDENTIFICACAO" && <div className="col-12">
     <div className="prototype-comissoes-bloco">
      <BlocoHeader icone="pi-id-card" titulo="Identificação" subtitulo="Dados que identificam a comissão no sistema." />
      <div className="grid">
       <RotuloSeplag nome="Número" cols="12 6 4"><div className="prototype-comissoes-campo-fixo-valor">{numeroForm}</div></RotuloSeplag>
       <DropdownFieldSeplag name="tipo" control={control} label="Tipo" required cols="12 6 4" options={TIPOS_COMISSAO} optionLabel="label" optionValue="value" showClear={false} getFormErrorMessage={() => null} />
       <DropdownFieldSeplag name="certameId" control={control} label="Concurso" cols="12 6 4" options={opcoesConcurso} optionLabel="label" optionValue="value" placeholder="Nenhum concurso vinculado" getFormErrorMessage={() => null} />
       <TextFieldSeplag name="nome" control={control} label="Nome" required cols="12" placeholder="Nome da comissão" getFormErrorMessage={() => null} />
       {finalHint && <div className="col-12"><small className="prototype-comissoes-hint">{finalHint}</small></div>}
       <TextAreaFieldSeplag name="finalidade" control={control} label="Finalidade" cols="12 6" getFormErrorMessage={() => null} />
       <TextAreaFieldSeplag name="observacoes" control={control} label="Observações" cols="12 6" getFormErrorMessage={() => null} />
      </div>
     </div>

     <div className="prototype-comissoes-bloco">
      <BlocoHeader icone="pi-calendar" titulo="Vigência" subtitulo="Prazos previstos e datas efetivas de funcionamento." />
      <div className="grid">
       <DateFieldSeplag name="previsaoInicio" control={control} label="Previsão início" cols="12 6 3" getFormErrorMessage={() => null} />
       <DateFieldSeplag name="inicio" control={control} label="Início" cols="12 6 3" getFormErrorMessage={() => null} />
       <DateFieldSeplag name="previsaoTermino" control={control} label="Previsão término" cols="12 6 3" getFormErrorMessage={() => null} />
       <DateFieldSeplag name="termino" control={control} label="Término" cols="12 6 3" getFormErrorMessage={() => null} />
      </div>
     </div>

     <div className="prototype-comissoes-bloco">
      <BlocoHeader icone="pi-building" titulo="Responsabilidade" subtitulo="Unidades e servidor responsáveis pela comissão." />
      <div className="grid">
       <DropdownFieldSeplag name="orgao" control={control} label="Órgão" required cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} getFormErrorMessage={() => null} />
       <DropdownFieldSeplag name="vinculoResponsavelId" control={control} label="Vínc. responsável" cols="12 6" options={SERVIDORES_CADASTRADOS.map((item) => ({ label:item.nome, value:item.id }))} optionLabel="label" optionValue="value" placeholder="Selecione o servidor responsável" getFormErrorMessage={() => null} />
       {responsavelSelecionado && <div className="col-12"><small className="prototype-comissoes-hint">{responsavelSelecionado.lotacao}</small></div>}
      </div>
     </div>
    </div>}

    {aba === "COMPOSICAO" && <div className="col-12">
     <div className="prototype-comissoes-bloco">
      <div className="prototype-comissoes-membros-head">
       <BlocoHeader icone="pi-users" titulo="Composição da comissão" subtitulo={`${membros.length} membro${membros.length === 1 ? "" : "s"} designado${membros.length === 1 ? "" : "s"}.`} />
       <BotaoAdicionarSeplag type="button" label="Adicionar membro" onClick={abrirNovoMembro} />
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
          <BotaoIconSeplag type="button" tooltip="Editar" icon="pi pi-pencil" onClick={() => editarMembro(membro)} />
          <BotaoIconSeplag type="button" severity="danger" tooltip="Excluir" icon="pi pi-trash" onClick={() => setMembroExcluirId(membro.id)} />
         </div>
        </div>)}
       </div>}
     </div>
    </div>}
   </CardSeplag>
  </form>

  <ModalSeplag
   visible={modalMembroAberto}
   titulo={membroEmEdicaoId ? "Editar membro" : "Adicionar membro"}
   fechar={fecharModalMembro}
   tamanho="700px"
   closeOnEscape
   customFooter={<div className="flex justify-content-end gap-2">
    <BotaoFecharSeplag type="button" label="Cancelar" icon="pi pi-times" onClick={fecharModalMembro} />
    <BotaoAdicionarSeplag type="button" label={membroEmEdicaoId ? "Salvar" : "Adicionar"} icon="pi pi-check" disabled={!servidorSelecionado} onClick={confirmarMembro} />
   </div>}
  >
   <div className="col-12 prototype-comissoes-membro-form">
    {erro && <p className="prototype-comissoes-erro">{erro}</p>}

    {!membroEmEdicaoId && !servidorSelecionado && <section className="prototype-comissoes-busca-servidor">
     <label className="prototype-native-field">
      <span>Servidor</span>
      <input type="text" value={buscaServidor} placeholder="Buscar por nome ou matrícula" onChange={(event) => setBuscaServidor(event.target.value)} />
     </label>
     <div className="prototype-comissoes-servidor-lista">
      {servidoresDisponiveis.length === 0
       ? <p className="prototype-comissoes-membros-empty">Nenhum servidor encontrado para "{buscaServidor}".</p>
       : servidoresDisponiveis.map((servidor) => <button type="button" key={servidor.id} className="prototype-comissoes-servidor-linha" onClick={() => setServidorSelecionadoId(servidor.id)}>
        <span className="prototype-comissoes-membro-iniciais" aria-hidden="true">{iniciaisNome(servidor.nome)}</span>
        <div className="prototype-comissoes-membro-dados"><strong>{servidor.nome}</strong><span>{servidor.lotacao} · {servidor.matricula}</span></div>
       </button>)}
     </div>
    </section>}

    {servidorSelecionado && <>
     <section className="prototype-comissoes-membro-recap">
      <div><span>Comissão</span><strong>{numeroForm} — {valores.nome || "(sem nome)"}</strong></div>
      <div><span>Período</span><strong>{valores.inicio || "—"} — {valores.termino || "em aberto"}</strong></div>
      <div><span>Servidor</span><strong>{servidorSelecionado.nome}</strong></div>
     </section>

     <div className="grid">
      <RadioButtonFieldSeplag name="cargo" control={membroForm.control} label="Cargo na comissão" required options={CARGOS_MEMBRO_COMISSAO} cols="12" getFormErrorMessage={() => null} />
      <DateFieldSeplag name="inicio" control={membroForm.control} label="Início" cols="12 6" getFormErrorMessage={() => null} />
      <DateFieldSeplag name="fim" control={membroForm.control} label="Fim" cols="12 6" getFormErrorMessage={() => null} />
     </div>

     <section className="prototype-comissoes-bloco">
      <BlocoHeader icone="pi-verified" titulo="Ato de nomeação" subtitulo="Instrumento legal que formaliza a designação do membro." />
      <div className="grid">
       <DropdownFieldSeplag name="tipoAto" control={membroForm.control} label="Tipo de ato" cols="12 6 4" options={TIPOS_ATO_NOMEACAO} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
       <TextFieldSeplag name="numeroAto" control={membroForm.control} label="Número do ato" cols="12 6 4" getFormErrorMessage={() => null} />
       <DateFieldSeplag name="dataPublicacao" control={membroForm.control} label="Data da publicação" cols="12 6 4" getFormErrorMessage={() => null} />
       <DropdownFieldSeplag name="localPublicacao" control={membroForm.control} label="Local da publicação" cols="12 6 4" options={LOCAIS_PUBLICACAO_ATO} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
      </div>
     </section>

     <section className="prototype-comissoes-bloco">
      <BlocoHeader icone="pi-paperclip" titulo="Arquivos" subtitulo="Anexe o PDF do ato de nomeação." />
      <AnexarDocumentoSeplag
       hideLabel
       arquivosBase64={arquivosAtoParaExibicao}
       multiple
       onUploadDocument={onUploadArquivoAto}
       handleViewArquivo={(arquivo) => arquivo && setArquivoVisualizando(arquivosAtoPendentes.find((item) => item.nome === arquivo.nome) ?? null)}
       onRemoveArquivo={(_arquivo, index) => index !== undefined && setArquivosAtoPendentes((atuais) => atuais.filter((_item, indice) => indice !== index))}
       onDownloadArquivo={(arquivo) => setArquivoVisualizando(arquivosAtoPendentes.find((item) => item.nome === arquivo.nome) ?? null)}
      />
      {arquivosAtoPendentes.length === 0 && <p className="prototype-comissoes-membros-empty">Nenhum arquivo anexado ainda.</p>}
     </section>
    </>}
   </div>
  </ModalSeplag>

  <Base64FileModal
   visible={arquivoVisualizando !== null}
   onHide={() => setArquivoVisualizando(null)}
   base64={arquivoVisualizando?.conteudoEmBase64 ?? null}
   mimeType="application/pdf"
   fileName={arquivoVisualizando?.nome}
   header={arquivoVisualizando?.nome}
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
