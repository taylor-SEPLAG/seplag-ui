import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BreadcrumbSeplag,
  CardSeplag,
  ModalSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "../../componentes";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./cedenteCessao.css";

const STORAGE_KEY = "sigep-prototype-cessoes-registros";
type DecisaoCedente = "DEVOLVER" | "INDEFERIR" | "AUTORIZAR";
type ResultadoBloco = "PENDENTE" | "APROVADO" | "CORRECAO" | "REVISAR";
type BlocoId = "servidor" | "destino" | "dados" | "documentos";

interface RegistroCessao {
  id: string; servidor: string; matricula: string; tipo: "INTERNA" | "EXTERNA";
  orgaoCedente: string; orgaoCessionario: string; inicio: string; fim: string;
  etapaAtual: string; situacao: string; processoSigadoc?: string; unidadeDestino?: string;
  hipotese?: string; atividades?: string; motivacao?: string; cargoComissionado?: string;
  cargoFuncao?: string; documentosCedente?: { solicitacaoManifestacaoLotacao?: string; manifestacaoLotacao: string; manifestacaoTecnica: string; despachoDecisao: string };
  analiseCedente?: Record<string, string>; analiseSeplag?: Record<string, string>; manifestacaoCentral?: string; conclusaoCentral?: string; observacaoCentral?: string; historico?: Array<{ data: string; acao: string; detalhe?: string }>;
}

interface EstadoBloco { resultado: ResultadoBloco; comentario: string }
const blocoVazio = (): EstadoBloco => ({ resultado: "PENDENTE", comentario: "" });
const titulos: Record<BlocoId, string> = { servidor: "1. Servidor e vínculos", destino: "2. Destino", dados: "3. Dados da cessão", documentos: "4. Documentos recebidos" };

function carregarRegistro(id?: string) {
  try { return (JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as RegistroCessao[]).find((item) => item.id === id); }
  catch { return undefined; }
}

function estadoInicial(analise: Record<string, string> | undefined, id: BlocoId): EstadoBloco {
  const resultado = analise?.[`${id}Resultado`] as ResultadoBloco | undefined;
  return { resultado: resultado || "PENDENTE", comentario: analise?.[`${id}Comentario`] || "" };
}

export function PrototiposCessaoCedentePage({ modo = "cedente" }: { modo?: "cedente" | "seplag" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<RegistroCessao | undefined>(() => carregarRegistro(id));
  const isSeplag = modo === "seplag";
  const analiseInicial = isSeplag ? registro?.analiseSeplag : registro?.analiseCedente;
  const [blocos, setBlocos] = useState<Record<BlocoId, EstadoBloco>>(() => ({
    servidor: estadoInicial(analiseInicial, "servidor"), destino: estadoInicial(analiseInicial, "destino"),
    dados: estadoInicial(analiseInicial, "dados"), documentos: estadoInicial(analiseInicial, "documentos"),
  }));
  const [docs, setDocs] = useState(() => ({ solicitacaoManifestacaoLotacao: registro?.documentosCedente?.solicitacaoManifestacaoLotacao || "", manifestacaoLotacao: registro?.documentosCedente?.manifestacaoLotacao || "", manifestacaoTecnica: registro?.documentosCedente?.manifestacaoTecnica || "", despachoDecisao: registro?.documentosCedente?.despachoDecisao || "" }));
  const [manifestacaoCentral, setManifestacaoCentral] = useState(registro?.manifestacaoCentral || "");
  const [conclusaoCentral, setConclusaoCentral] = useState(registro?.conclusaoCentral || "");
  const [observacaoCentral, setObservacaoCentral] = useState(registro?.observacaoCentral || "");
  const [decisao, setDecisao] = useState<DecisaoCedente | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [erroDecisao, setErroDecisao] = useState("");
  const somenteLeitura = registro?.situacao !== (isSeplag ? "AGUARDANDO_SEPLAG" : "AGUARDANDO_CEDENTE");
  const idsBloco = Object.keys(titulos) as BlocoId[];
  const correcoes = idsBloco.filter((bloco) => blocos[bloco].resultado === "CORRECAO");
  const comentariosCompletos = correcoes.every((bloco) => blocos[bloco].comentario.trim());
  const inconsistencias: Record<BlocoId, string[]> = {
    servidor: [!registro?.servidor && "Servidor não informado", !registro?.matricula && "Vínculo/matrícula não informado"].filter(Boolean) as string[],
    destino: [!registro?.orgaoCessionario && "Órgão cessionário não informado", !registro?.unidadeDestino && "Unidade de exercício não informada"].filter(Boolean) as string[],
    dados: [!registro?.hipotese && "Hipótese não informada", (!registro?.inicio || !registro?.fim) && "Período incompleto", !registro?.atividades && "Atividades não informadas", !registro?.motivacao && "Motivação não informada"].filter(Boolean) as string[],
    documentos: [!registro?.processoSigadoc && "Ofício/processo SIGADOC não vinculado", !docs.manifestacaoLotacao && "Manifestação da lotação não vinculada", !docs.manifestacaoTecnica && "Manifestação técnica setorial não vinculada", !docs.despachoDecisao && "Despacho do dirigente não vinculado"].filter(Boolean) as string[],
  };
  const todosAprovados = idsBloco.every((bloco) => blocos[bloco].resultado === "APROVADO" && (!isSeplag || inconsistencias[bloco].length === 0));
  const documentosConcluidos = Boolean(docs.manifestacaoLotacao.trim() && docs.manifestacaoTecnica.trim() && docs.despachoDecisao.trim());
  const podeAutorizar = todosAprovados && (isSeplag ? Boolean(manifestacaoCentral.trim() && conclusaoCentral === "FAVORAVEL") : documentosConcluidos) && !somenteLeitura;
  const podeDevolver = correcoes.length > 0 && comentariosCompletos && !somenteLeitura;
  const pendencias = idsBloco.filter((bloco) => blocos[bloco].resultado !== "APROVADO" || (isSeplag && inconsistencias[bloco].length > 0)).length + (isSeplag ? (!manifestacaoCentral.trim() || conclusaoCentral !== "FAVORAVEL" ? 1 : 0) : [docs.manifestacaoLotacao, docs.manifestacaoTecnica, docs.despachoDecisao].filter((valor) => !valor.trim()).length);

  const atualizarBloco = (idBloco: BlocoId, parcial: Partial<EstadoBloco>) => setBlocos((atual) => ({ ...atual, [idBloco]: { ...atual[idBloco], ...parcial } }));
  const abrirDecisao = (tipo: DecisaoCedente) => { setJustificativa(""); setErroDecisao(""); setDecisao(tipo); };

  const persistir = (situacao: string, etapaAtual: string, acao: string, detalhe?: string) => {
    if (!registro) return;
    const analiseAtual = idsBloco.reduce<Record<string, string>>((acc, bloco) => {
      acc[`${bloco}Resultado`] = blocos[bloco].resultado; acc[`${bloco}Comentario`] = blocos[bloco].comentario.trim(); return acc;
    }, {});
    const atualizado: RegistroCessao = { ...registro, situacao, etapaAtual, documentosCedente: docs, manifestacaoCentral, conclusaoCentral, observacaoCentral,
      ...(isSeplag ? { analiseSeplag: analiseAtual } : { analiseCedente: analiseAtual }),
      historico: [...(registro.historico || []), { data: new Date().toLocaleString("pt-BR"), acao, detalhe }] };
    const itens = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as RegistroCessao[];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens.map((item) => item.id === atualizado.id ? atualizado : item)));
    setRegistro(atualizado);
  };

  const confirmarDecisao = () => {
    if (!registro || !decisao) return;
    if (decisao === "DEVOLVER" && !podeDevolver) { setErroDecisao("Marque ao menos um bloco para correção e informe o comentário obrigatório."); return; }
    if (!isSeplag && decisao === "INDEFERIR" && (!justificativa.trim() || !docs.despachoDecisao.trim())) { setErroDecisao("Informe a justificativa e vincule o despacho de indeferimento."); return; }
    if (decisao === "AUTORIZAR" && !podeAutorizar) { setErroDecisao(isSeplag ? "Marque todos os blocos como conformes, escolha conclusão favorável e vincule a manifestação técnica central." : "Aprove todos os blocos e vincule os três documentos do Cedente."); return; }
    if (decisao === "DEVOLVER") {
      const detalhe = correcoes.map((bloco) => `${titulos[bloco]}: ${blocos[bloco].comentario.trim()}`).join(" | ");
      persistir(isSeplag ? "AGUARDANDO_CEDENTE" : "DEVOLVIDA", isSeplag ? "Órgão cedente — complementação" : "Órgão cessionário", isSeplag ? "Devolvida pela SEPLAG para complementação" : "Devolvida para correção pelo órgão cedente", detalhe);
    } else if (decisao === "INDEFERIR") {
      persistir("INDEFERIDA", "Processo encerrado", "Indeferida pelo órgão cedente", justificativa.trim());
    } else {
      persistir(isSeplag ? "AGUARDANDO_PUBLICACAO" : "AGUARDANDO_SEPLAG", isSeplag ? "Publicação" : "SEPLAG", isSeplag ? "Análise central concluída e encaminhada para publicação" : "Autorizada pelo órgão cedente e encaminhada à SEPLAG");
    }
    setDecisao(null);
    navigate("/prototipos/sigep/movimentacao/cessoes");
  };

  if (!registro) return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><div className="prototype-page-content prototype-page-content--white"><BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: isSeplag ? "Análise da SEPLAG" : "Análise do cedente" }]} /><CardSeplag title="Solicitação não encontrada" cols="12"><div className="col-12 prototype-cedente-empty"><i className="pi pi-exclamation-circle" /><p>Não foi possível localizar esta solicitação no protótipo.</p><BotaoVoltarSeplag label="Voltar para cessões" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /></div></CardSeplag></div></PrototypeSystemPage>;

  const renderDecisaoBloco = (idBloco: BlocoId) => <div className={`prototype-cedente-block-decision is-${blocos[idBloco].resultado.toLowerCase()}`}>
    {isSeplag && inconsistencias[idBloco].length > 0 && <div className="prototype-seplag-validation-warning"><i className="pi pi-exclamation-triangle" /><div><strong>Dados obrigatórios ausentes</strong><ul>{inconsistencias[idBloco].map((item) => <li key={item}>{item}</li>)}</ul></div></div>}
    <div className="prototype-cedente-block-actions"><span>{isSeplag ? "Conformidade deste bloco" : "Decisão sobre este bloco"}</span><button type="button" disabled={somenteLeitura || (isSeplag && inconsistencias[idBloco].length > 0)} className={blocos[idBloco].resultado === "APROVADO" ? "is-selected approve" : "approve"} onClick={() => atualizarBloco(idBloco, { resultado: "APROVADO", comentario: "" })}><i className="pi pi-check-circle" /> {isSeplag ? "Marcar como conforme" : "Aprovar informações"}</button><button type="button" disabled={somenteLeitura} className={blocos[idBloco].resultado === "CORRECAO" ? "is-selected correction" : "correction"} onClick={() => atualizarBloco(idBloco, { resultado: "CORRECAO" })}><i className="pi pi-replay" /> {isSeplag ? "Solicitar complementação" : "Solicitar correção"}</button></div>
    {blocos[idBloco].resultado === "CORRECAO" && <TextAreaFieldSeplag name={`${idBloco}Comentario`} label={isSeplag ? "Comentário para o órgão cedente" : "Comentário para o órgão cessionário"} value={blocos[idBloco].comentario} onChange={(valor) => atualizarBloco(idBloco, { comentario: valor })} rows={3} maxLength={1000} required disabled={somenteLeitura} cols="12" getFormErrorMessage={() => !blocos[idBloco].comentario.trim() ? "Informe o que precisa ser corrigido." : null} />}
  </div>;

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-cedente-page">
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: registro.id }, { label: isSeplag ? "Análise da SEPLAG" : "Análise do cedente" }]} />
      <CardSeplag title={isSeplag ? "Análise da cessão pela SEPLAG" : "Análise da cessão pelo órgão cedente"} cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card"><div className="col-12 prototype-cedente-content">
        <div className="prototype-cedente-heading"><div><span>{registro.id}</span><h3>{registro.servidor}</h3><p>Matrícula(s): {registro.matricula} • Processo SIGADOC: {registro.processoSigadoc || "Não vinculado"}</p></div><BadgeSeplag label={registro.situacao === "AGUARDANDO_CEDENTE" ? "Aguardando análise do cedente" : registro.situacao === "AGUARDANDO_SEPLAG" ? "Aguardando análise da SEPLAG" : registro.etapaAtual} color="#8a5c00" bg="#fff1cf" border="transparent" size="sm" /></div>
        <div className="prototype-cedente-guidance"><i className="pi pi-info-circle" /><span>{isSeplag ? "Confira a regularidade de cada bloco e a instrução realizada pelo Cedente. Pendências devem ser devolvidas ao órgão cedente para complementação." : "Confira cada bloco recebido. Se houver inconsistência, solicite a correção e explique ao órgão cessionário o que deve ser ajustado."}</span></div>

        <section className="prototype-cedente-section"><header><div><i className="pi pi-user" /><span><h4>{titulos.servidor}</h4><p>Identificação e vínculos abrangidos pela solicitação.</p></span></div><BadgeSeplag label={blocos.servidor.resultado === "APROVADO" ? "Aprovado" : blocos.servidor.resultado === "CORRECAO" ? "Correção solicitada" : blocos.servidor.resultado === "REVISAR" ? "Revisar novamente" : "Pendente"} color={blocos.servidor.resultado === "APROVADO" ? "#147441" : "#8a5c00"} bg={blocos.servidor.resultado === "APROVADO" ? "#e2f5e8" : "#fff1cf"} border="transparent" size="sm" /></header><dl className="prototype-cedente-summary"><div><dt>Servidor</dt><dd>{registro.servidor}</dd></div><div><dt>Matrícula(s)</dt><dd>{registro.matricula}</dd></div><div><dt>Situação funcional</dt><dd>Consultar cadastro funcional</dd></div></dl>{renderDecisaoBloco("servidor")}</section>

        <section className="prototype-cedente-section"><header><div><i className="pi pi-building" /><span><h4>{titulos.destino}</h4><p>Órgão, unidade de exercício e cargo ou função.</p></span></div><BadgeSeplag label={blocos.destino.resultado === "APROVADO" ? "Aprovado" : blocos.destino.resultado === "CORRECAO" ? "Correção solicitada" : blocos.destino.resultado === "REVISAR" ? "Revisar novamente" : "Pendente"} color={blocos.destino.resultado === "APROVADO" ? "#147441" : "#8a5c00"} bg={blocos.destino.resultado === "APROVADO" ? "#e2f5e8" : "#fff1cf"} border="transparent" size="sm" /></header><dl className="prototype-cedente-summary"><div><dt>Cessionário</dt><dd>{registro.orgaoCessionario}</dd></div><div><dt>Unidade de exercício</dt><dd>{registro.unidadeDestino || "Não informada"}</dd></div><div><dt>Cargo ou função</dt><dd>{registro.cargoComissionado === "SIM" ? registro.cargoFuncao || "Sim — não especificado" : "Não"}</dd></div></dl>{renderDecisaoBloco("destino")}</section>

        <section className="prototype-cedente-section"><header><div><i className="pi pi-file-edit" /><span><h4>{titulos.dados}</h4><p>Hipótese, período, atividades, motivação e ônus.</p></span></div><BadgeSeplag label={blocos.dados.resultado === "APROVADO" ? "Aprovado" : blocos.dados.resultado === "CORRECAO" ? "Correção solicitada" : blocos.dados.resultado === "REVISAR" ? "Revisar novamente" : "Pendente"} color={blocos.dados.resultado === "APROVADO" ? "#147441" : "#8a5c00"} bg={blocos.dados.resultado === "APROVADO" ? "#e2f5e8" : "#fff1cf"} border="transparent" size="sm" /></header><dl className="prototype-cedente-summary"><div><dt>Hipótese</dt><dd>{registro.hipotese || "Não informada"}</dd></div><div><dt>Período</dt><dd>{registro.inicio} a {registro.fim}</dd></div><div><dt>Ônus</dt><dd>Órgão cessionário — sem reembolso</dd></div><div className="is-wide"><dt>Atividades</dt><dd>{registro.atividades || "Não informadas"}</dd></div><div className="is-wide"><dt>Motivação</dt><dd>{registro.motivacao || "Não informada"}</dd></div></dl>{renderDecisaoBloco("dados")}</section>

        <section className="prototype-cedente-section"><header><div><i className="pi pi-paperclip" /><span><h4>{titulos.documentos}</h4><p>Documentos vinculados pelo órgão cessionário.</p></span></div><BadgeSeplag label={blocos.documentos.resultado === "APROVADO" ? "Aprovado" : blocos.documentos.resultado === "CORRECAO" ? "Correção solicitada" : blocos.documentos.resultado === "REVISAR" ? "Revisar novamente" : "Pendente"} color={blocos.documentos.resultado === "APROVADO" ? "#147441" : "#8a5c00"} bg={blocos.documentos.resultado === "APROVADO" ? "#e2f5e8" : "#fff1cf"} border="transparent" size="sm" /></header><dl className="prototype-cedente-summary"><div className="is-wide"><dt>Ofício/processo SIGADOC</dt><dd>{registro.processoSigadoc || "Não vinculado"}</dd></div></dl>{renderDecisaoBloco("documentos")}</section>

        <section className="prototype-cedente-section"><header><div><i className="pi pi-briefcase" /><span><h4>Instrução do órgão cedente</h4><p>Vincule os documentos produzidos pelo Cedente antes do encaminhamento à SEPLAG.</p></span></div></header><div className="grid prototype-cedente-documents"><TextFieldSeplag name="solicitacaoManifestacaoLotacao" label="Solicitação de manifestação da unidade de lotação (opcional)" value={docs.solicitacaoManifestacaoLotacao} onChange={(valor) => setDocs((atual) => ({ ...atual, solicitacaoManifestacaoLotacao: valor }))} placeholder="Número ou referência SIGADOC" disabled={somenteLeitura || isSeplag} cols="12 6" getFormErrorMessage={() => null} /><TextFieldSeplag name="manifestacaoLotacao" label="Manifestação da unidade de lotação" value={docs.manifestacaoLotacao} onChange={(valor) => setDocs((atual) => ({ ...atual, manifestacaoLotacao: valor }))} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura || isSeplag} cols="12 6" getFormErrorMessage={() => null} /><TextFieldSeplag name="manifestacaoTecnica" label="Manifestação técnica da área setorial" value={docs.manifestacaoTecnica} onChange={(valor) => setDocs((atual) => ({ ...atual, manifestacaoTecnica: valor }))} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura || isSeplag} cols="12 6" getFormErrorMessage={() => null} /><TextFieldSeplag name="despachoDecisao" label="Despacho do dirigente máximo" value={docs.despachoDecisao} onChange={(valor) => setDocs((atual) => ({ ...atual, despachoDecisao: valor }))} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura || isSeplag} cols="12 6" getFormErrorMessage={() => null} /></div>{isSeplag ? <div className="grid prototype-cedente-documents"><TextFieldSeplag name="manifestacaoCentral" label="Manifestação técnica do órgão central" value={manifestacaoCentral} onChange={setManifestacaoCentral} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} /></div> : <div className="prototype-cedente-note"><i className="pi pi-lock" /> A manifestação técnica do órgão central será produzida posteriormente pela SEPLAG e não é preenchida pelo Cedente.</div>}</section>

        {!somenteLeitura && <div className={podeAutorizar ? "prototype-cedente-readiness is-ready" : "prototype-cedente-readiness"}><i className={podeAutorizar ? "pi pi-check-circle" : "pi pi-exclamation-triangle"} /><span>{podeAutorizar ? "Análise completa. A solicitação pode ser encaminhada à SEPLAG." : `${pendencias} pendência(s). Aprove todos os blocos e complete os documentos do Cedente.`}</span></div>}
        <div className="prototype-cedente-actions"><BotaoVoltarSeplag label="Voltar" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /><div>{!somenteLeitura && <><BotaoVoltarSeplag label={isSeplag ? "Devolver ao Cedente para complementação" : "Devolver para correção"} icon="pi pi-replay" disabled={!podeDevolver} tooltip={!podeDevolver ? "Marque um bloco para correção e informe o comentário." : undefined} onClick={() => abrirDecisao("DEVOLVER")} />{!isSeplag && <BotaoVoltarSeplag label="Indeferir" icon="pi pi-times" onClick={() => abrirDecisao("INDEFERIR")} />}<BotaoSalvarSeplag label={isSeplag ? "Concluir análise e encaminhar para publicação" : "Autorizar e encaminhar à SEPLAG"} icon="pi pi-send" disabled={!podeAutorizar} tooltip={!podeAutorizar ? "Conclua a análise e os documentos obrigatórios." : undefined} onClick={() => abrirDecisao("AUTORIZAR")} /></>}</div></div>
      </div></CardSeplag>

      <ModalSeplag visible={Boolean(decisao)} titulo={decisao === "DEVOLVER" ? (isSeplag ? "Devolver para complementação" : "Devolver para correção") : decisao === "INDEFERIR" ? "Indeferir solicitação" : "Autorizar cessão"} tamanho="38rem" fechar={() => setDecisao(null)} labelFechar="Cancelar" labelAcao={decisao === "AUTORIZAR" ? (isSeplag ? "Concluir e encaminhar" : "Autorizar e encaminhar") : decisao === "INDEFERIR" ? "Indeferir" : "Devolver"} iconAcao={decisao === "AUTORIZAR" ? "pi pi-send" : "pi pi-check"} funcAcao={confirmarDecisao}><div className="grid prototype-cedente-decision-modal">{decisao === "INDEFERIR" ? <TextAreaFieldSeplag name="justificativaDecisao" label="Justificativa do indeferimento" value={justificativa} onChange={(valor) => { setJustificativa(valor); setErroDecisao(""); }} rows={4} maxLength={1000} required cols="12" getFormErrorMessage={() => erroDecisao || null} /> : <div className="col-12 prototype-cedente-confirm"><i className="pi pi-info-circle" /><span>{decisao === "DEVOLVER" ? `Serão enviados ${correcoes.length} comentário(s) de correção ao órgão cessionário.` : (isSeplag ? "Ao confirmar, o processo será encaminhado para publicação." : "Ao confirmar, o processo será encaminhado para análise da SEPLAG.")}</span></div>}{erroDecisao && decisao !== "INDEFERIR" && <small className="col-12 p-error">{erroDecisao}</small>}</div></ModalSeplag>
    </div>
  </PrototypeSystemPage>;
}












