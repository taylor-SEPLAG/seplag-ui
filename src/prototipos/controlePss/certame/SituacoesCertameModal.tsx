import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { calcularPrazoPrestacaoContas, dataEfeitoAnteriorPublicacao, homologacaoVigenteSemCancelamento, podeRegistrarRetificacaoEdital, podeRegistrarRetificacaoHomologacao } from "./validations";
import { DOCUMENTOS_POR_SITUACAO, SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import { DocumentosCertameTabela, type DocumentoCertameCatalogoItem, SeletorFormaAssinaturaDocumento, TAMANHO_MAXIMO_DOCUMENTO_CERTAME, arquivoDocumentoCertameValido } from "./DocumentosCertameTabela";
import type { Certame, DocumentoCertame, SituacaoCertame, TipoDocumentoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoSeplag } from "@componentes/Botao";
import { DateFieldSeplag, DropdownFieldSeplag } from "@componentes/Fields";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import "./certame.css";

// Monta o mapa {tipo: arquivo} para semear a tabela de "Registrar nova situação" com os documentos
// já anexados ao certame para o tipo selecionado — inclusive quando o tipo foi selecionado ao
// clicar numa situação do histórico só para consultar seus documentos (ver irParaDocumentosDaSituacao).
function arquivosDoCatalogo(catalogo:readonly DocumentoCertameCatalogoItem[] | undefined, certame:Certame | undefined):Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>> {
 if (!catalogo || !certame) return {};
 const mapa:Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>> = {};
 for (const doc of catalogo) {
  const existente = certame.documentos.find((item) => item.tipo === doc.tipo);
  if (existente) mapa[doc.tipo as TipoDocumentoCertame] = { nome:existente.nomeArquivo, extensao:"pdf", contentType:"application/pdf", conteudoEmBase64:"" };
 }
 return mapa;
}

interface SituacaoFormValues { tipo:SituacaoCertame; data?:string }

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;

// Modal de "Situações" do certame — acessado pelo atalho de histórico na listagem (Ações), sem
// precisar abrir o cadastro completo só para consultar ou registrar uma situação.
export function SituacoesCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
 const { certames } = useControlePssStore();
 const certame = certames.find((item) => item.id === certameId);
 const [erro, setErro] = useState<string | null>(null);
 const [arquivoSituacao, setArquivoSituacao] = useState<ArquivoAnexadoSeplag | null>(null);
 const situacaoForm = useForm<SituacaoFormValues>({ defaultValues: { tipo:"HOMOLOGADO" } });
 const tipoSelecionado = situacaoForm.watch("tipo");
 // Cada situação com catálogo definido (Abertura, Retificação de Edital, Homologação e Retificação
 // de Homologação — ver dominios.DOCUMENTOS_POR_SITUACAO) exige a lista específica de documentos do
 // Manual de Orientação do TCE-MT, em vez do upload único e genérico de "documento de apoio".
 const catalogoDocumentos = DOCUMENTOS_POR_SITUACAO[tipoSelecionado];
 const [documentosSituacao, setDocumentosSituacao] = useState<Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>>({});
 // Não persistido no Certame (mesma limitação do cadastro completo — ver formaAssinaturaDocumentos
 // em CertameFormContent.tsx): vale só enquanto o modal está aberto.
 const [processosSigadocSituacao, setProcessosSigadocSituacao] = useState<Partial<Record<TipoDocumentoCertame, string>>>({});
 const [formaAssinaturaSituacao, setFormaAssinaturaSituacao] = useState<"fisica" | "sigadoc">("sigadoc");
 // Cada situação do histórico com catálogo de documentos (ver DOCUMENTOS_POR_SITUACAO) é clicável —
 // em vez de duplicar a tabela de documentos, o clique só troca a "Nova situação" para o mesmo tipo
 // e rola até a lista de "Registrar nova situação" logo abaixo, que já carrega os documentos
 // anexados àquele tipo (mesma lista onde eles foram salvos, seja aqui ou na aba Documentos). Nesse
 // caso a lista fica somente leitura — são documentos de uma situação já registrada, não um rascunho
 // a preencher; volta a ficar editável assim que o usuário escolhe outro tipo manualmente no dropdown.
 const documentosSituacaoRef = useRef<HTMLDivElement | null>(null);
 const [modoConsultaHistorico, setModoConsultaHistorico] = useState(false);
 const irParaDocumentosDaSituacao = (tipo:SituacaoCertame) => {
  situacaoForm.setValue("tipo", tipo);
  setModoConsultaHistorico(true);
  documentosSituacaoRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
 };

 // Força o remount de DocumentosCertameTabela sempre que a semeadura roda (troca de tipo, seja pelo
 // dropdown ou pelo clique numa situação do histórico) — o DataTable do PrimeReact não repinta as
 // células ao receber um novo `arquivos` via prop simples (só ao trocar sua própria `key`).
 const [documentosSituacaoVersao, setDocumentosSituacaoVersao] = useState(0);
 useEffect(() => {
  setDocumentosSituacao(arquivosDoCatalogo(catalogoDocumentos, certame));
  setDocumentosSituacaoVersao((versao) => versao + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [tipoSelecionado, certame?.id]);

 const uploadArquivoSituacao = (event:{ files?:File[] }) => {
  const selecionado = event.files?.[0];
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) { setErro("Documento inválido: formato aceito .pdf, com até 10MB."); return; }
  setErro(null);
  const reader = new FileReader();
  reader.onload = () => setArquivoSituacao({ nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size });
  reader.readAsDataURL(selecionado);
 };

 const onChangeArquivoSituacao = (tipo:TipoDocumentoCertame, arquivo:ArquivoAnexadoSeplag | undefined) => setDocumentosSituacao((atuais) => ({ ...atuais, [tipo]: arquivo }));
 const onChangeProcessoSigadocSituacao = (tipo:TipoDocumentoCertame, numero:string | undefined) => setProcessosSigadocSituacao((atuais) => ({ ...atuais, [tipo]: numero }));

 const registrarSituacao = () => {
  if (!certame) return;
  const dados = situacaoForm.getValues();
  if (!dados.data) { setErro("Informe a data de efeito da situação."); return; }
  // RN-24d — mesma lógica de RN-07/CA05, aplicada à data de efeito da situação.
  if (dataEfeitoAnteriorPublicacao(dados.data, certame.dataPublicacaoEdital)) { setErro("A data de efeito não pode ser anterior à publicação do edital (RN-24d)."); return; }
  // RN-24a (ER142).
  if (dados.tipo === "RETIFICACAO_EDITAL" && !podeRegistrarRetificacaoEdital(certame.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Edital: o certame ainda não possui um registro de abertura (Aberto) no histórico (RN-24a)."); return; }
  // RN-24b (ER144).
  if (dados.tipo === "HOMOLOGADO" && homologacaoVigenteSemCancelamento(certame.historicoSituacoes)) { setErro("Já existe uma Homologação registrada para este certame sem Cancelamento/Anulação posterior (RN-24b)."); return; }
  // RN-24c (ER145).
  if (dados.tipo === "RETIFICACAO_HOMOLOGACAO" && !podeRegistrarRetificacaoHomologacao(certame.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Homologação sem um registro de Homologado anterior no histórico (RN-24c)."); return; }
  setErro(null);
  const prazo = calcularPrazoPrestacaoContas(dados.data);
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const totalAnexados = catalogoDocumentos?.filter((item) => documentosSituacao[item.tipo as TipoDocumentoCertame]).length ?? 0;
  const documentoAnexadoResumo = catalogoDocumentos
   ? (totalAnexados > 0 ? `${totalAnexados} de ${catalogoDocumentos.length} documentos anexados` : undefined)
   : arquivoSituacao?.nome;
  const documentosAtualizados:readonly DocumentoCertame[] = catalogoDocumentos
   ? (() => {
      const mapa = new Map(certame.documentos.map((doc) => [doc.tipo, doc]));
      for (const item of catalogoDocumentos) {
       const arquivo = documentosSituacao[item.tipo as TipoDocumentoCertame];
       if (arquivo) mapa.set(item.tipo as TipoDocumentoCertame, { tipo:item.tipo as TipoDocumentoCertame, nomeArquivo:arquivo.nome, anexadoEm:agora });
      }
      return Array.from(mapa.values());
     })()
   : certame.documentos;
  const registro = { id:`SIT-${certame.id}-${certame.historicoSituacoes.length + 1}`, certameId:certame.id, tipo:dados.tipo, dataEfeito:dados.data, registradoEm:`${agora} ${new Date().toTimeString().slice(0, 5)}`, usuario:CONTROLE_PSS_USUARIO_LOGADO, prazoPrestacaoContas:prazo, documentoAnexado:documentoAnexadoResumo };
  controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === certame.id ? { ...item, situacaoAtual:dados.tipo, historicoSituacoes:[...item.historicoSituacoes, registro], documentos:documentosAtualizados, atualizadoEm:dados.data! } : item));
  situacaoForm.reset({ tipo:"HOMOLOGADO", data:"" });
  setArquivoSituacao(null);
  setDocumentosSituacao({});
  setProcessosSigadocSituacao({});
  setModoConsultaHistorico(false);
 };

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Situações — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="920px" hideFooter closeOnEscape>
  <div className="col-12">
   {erro && <MensagemSeplag severity="error" message={erro} cols="12" />}
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
    <ol className="prototype-certame-timeline">{[...certame.historicoSituacoes].reverse().map((item, indice) => {
     const catalogo = DOCUMENTOS_POR_SITUACAO[item.tipo];
     return <li key={item.id}>
      <i className={indice === 0 ? "active" : ""} />
      <div className="date"><strong>{item.dataEfeito}</strong><small>registrado em {item.registradoEm}</small></div>
      <div className="event">
       {catalogo
        ? <button type="button" className="prototype-certame-situacao-evento-btn" onClick={() => irParaDocumentosDaSituacao(item.tipo)}>
           <strong>{situacaoLabel[item.tipo]}</strong>
           <span className="prototype-certame-situacao-evento-btn-dica">ver documentos</span>
           <i className="pi pi-arrow-down" aria-hidden="true" />
          </button>
        : <strong>{situacaoLabel[item.tipo]}</strong>}
       {item.prazoPrestacaoContas && <p>Prazo de prestação de contas ao TCE-MT: até {item.prazoPrestacaoContas} (RN-15).</p>}
       {item.documentoAnexado && <p><i className="pi pi-paperclip" aria-hidden="true" /> {item.documentoAnexado}</p>}
       <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {item.usuario}</small>
      </div>
     </li>;
    })}</ol>
   </div>
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-plus-circle" titulo="Registrar nova situação" subtitulo="Adicione uma nova situação ao histórico do certame." />
    <div className="grid align-items-end prototype-certame-subform">
     <DropdownFieldSeplag name="tipo" control={situacaoForm.control} label="Nova situação" cols="12 6 6" options={[...SITUACOES_CERTAME]} optionLabel="label" optionValue="value" onChange={() => setModoConsultaHistorico(false)} getFormErrorMessage={() => null} />
     <DateFieldSeplag name="data" control={situacaoForm.control} label="Data de efeito" cols="12 6 3" getFormErrorMessage={() => null} />
     {!catalogoDocumentos && <AnexarDocumentoSeplag cols="12 6 3" label="Documento de apoio (opcional)" arquivoBase64={arquivoSituacao ?? undefined} onUploadDocument={uploadArquivoSituacao} onRemoveArquivo={() => setArquivoSituacao(null)} handleViewArquivo={() => {}} canView={false} accept="application/pdf" maxFileSize={TAMANHO_MAXIMO_DOCUMENTO_CERTAME} helpText="" chooseIconOnly />}
     {catalogoDocumentos && <div className="col-12 prototype-certame-situacao-documentos" ref={documentosSituacaoRef}>
      <span className="prototype-certame-situacao-documentos-titulo">Documentos de {situacaoLabel[tipoSelecionado]} {modoConsultaHistorico ? "(já registrados)" : "(opcionais)"}</span>
      <SeletorFormaAssinaturaDocumento valor={formaAssinaturaSituacao} onChange={setFormaAssinaturaSituacao} name="forma-assinatura-situacao-certame" />
      <DocumentosCertameTabela key={documentosSituacaoVersao} documentos={catalogoDocumentos} arquivos={documentosSituacao} onChangeArquivo={onChangeArquivoSituacao} processosSigadoc={processosSigadocSituacao} onChangeProcessoSigadoc={onChangeProcessoSigadocSituacao} formaAssinatura={formaAssinaturaSituacao} documentoObrigatorio={() => false} onError={setErro} somenteLeitura={modoConsultaHistorico} />
     </div>}
     <div className="col-12 md:col-3"><BotaoSeplag type="button" label="Registrar situação" icon="pi pi-check" onClick={registrarSituacao} /></div>
    </div>
   </div>
  </div>
 </ModalSeplag>;
}

export default SituacoesCertameModal;
