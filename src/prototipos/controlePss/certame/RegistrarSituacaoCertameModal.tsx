import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { calcularPrazoPrestacaoContas, dataEfeitoAnteriorPublicacao, homologacaoVigenteSemCancelamento, podeRegistrarRetificacaoEdital, podeRegistrarRetificacaoHomologacao } from "./validations";
import { DOCUMENTOS_POR_SITUACAO, SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import { DocumentosCertameTabela, type DocumentoCertameCatalogoItem, TAMANHO_MAXIMO_DOCUMENTO_CERTAME, arquivoDocumentoCertameValido } from "./DocumentosCertameTabela";
import type { Certame, DocumentoCertame, SituacaoCertame, TipoDocumentoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoSeplag } from "@componentes/Botao";
import { DateFieldSeplag, DropdownFieldSeplag } from "@componentes/Fields";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import "./certame.css";

// Monta o mapa {tipo: arquivo} para semear a tabela com os documentos já anexados ao certame para o
// tipo selecionado (mesma lista lida/gravada tanto aqui quanto na aba Documentos do cadastro).
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

// Modal de "Registrar situação" do certame — só o formulário de inclusão; para consultar o
// histórico já registrado, ver HistoricoSituacoesCertameModal (ação separada na listagem).
export function RegistrarSituacaoCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
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
 // Força o remount de DocumentosCertameTabela sempre que a semeadura roda (troca de tipo) — o
 // DataTable do PrimeReact não repinta as células ao receber um novo `arquivos` via prop simples.
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
 };

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Registrar situação — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="820px" hideFooter closeOnEscape>
  <div className="col-12">
   {erro && <MensagemSeplag severity="error" message={erro} cols="12" />}
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-plus-circle" titulo="Registrar nova situação" subtitulo="Adicione uma nova situação ao histórico do certame." />
    <div className="grid align-items-end prototype-certame-subform">
     <DropdownFieldSeplag name="tipo" control={situacaoForm.control} label="Nova situação" cols="12 6 6" options={[...SITUACOES_CERTAME]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
     <DateFieldSeplag name="data" control={situacaoForm.control} label="Data de efeito" cols="12 6 3" getFormErrorMessage={() => null} />
     {!catalogoDocumentos && <AnexarDocumentoSeplag cols="12 6 3" label="Documento de apoio (opcional)" arquivoBase64={arquivoSituacao ?? undefined} onUploadDocument={uploadArquivoSituacao} onRemoveArquivo={() => setArquivoSituacao(null)} handleViewArquivo={() => {}} canView={false} accept="application/pdf" maxFileSize={TAMANHO_MAXIMO_DOCUMENTO_CERTAME} helpText="" chooseIconOnly />}
     {catalogoDocumentos && <div className="col-12 prototype-certame-situacao-documentos">
      <span className="prototype-certame-situacao-documentos-titulo">Documentos de {situacaoLabel[tipoSelecionado]} (opcionais)</span>
      <DocumentosCertameTabela key={documentosSituacaoVersao} documentos={catalogoDocumentos} arquivos={documentosSituacao} onChangeArquivo={onChangeArquivoSituacao} documentoObrigatorio={() => false} onError={setErro} />
     </div>}
     <div className="col-12 md:col-3"><BotaoSeplag type="button" label="Registrar situação" icon="pi pi-check" onClick={registrarSituacao} /></div>
    </div>
   </div>
  </div>
 </ModalSeplag>;
}

export default RegistrarSituacaoCertameModal;
