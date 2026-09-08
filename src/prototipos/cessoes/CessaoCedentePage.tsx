import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BreadcrumbSeplag,
  CardSeplag,
  ModalSeplag,
  RadioButtonFieldSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "../../componentes";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./cedenteCessao.css";

const STORAGE_KEY = "sigep-prototype-cessoes-registros";

type DecisaoCedente = "DEVOLVER" | "INDEFERIR" | "AUTORIZAR";

interface RegistroCessao {
  id: string;
  servidor: string;
  matricula: string;
  tipo: "INTERNA" | "EXTERNA";
  orgaoCedente: string;
  orgaoCessionario: string;
  inicio: string;
  fim: string;
  etapaAtual: string;
  situacao: string;
  processoSigadoc?: string;
  unidadeDestino?: string;
  hipotese?: string;
  atividades?: string;
  motivacao?: string;
  cargoComissionado?: string;
  cargoFuncao?: string;
  documentosCedente?: {
    manifestacaoLotacao: string;
    manifestacaoTecnica: string;
    despachoDecisao: string;
  };
  analiseCedente?: Record<string, string>;
  historico?: Array<{ data: string; acao: string; detalhe?: string }>;
}

interface AnaliseCedenteForm {
  situacaoFuncional: string;
  semEventoImpeditivo: string;
  carreiraPermite: string;
  onusConfirmado: string;
  compatibilidadeProbatorio: string;
  manifestacaoLotacao: string;
  manifestacaoTecnica: string;
  despachoDecisao: string;
}

const opcoesValidacao = [
  { label: "Sim", value: "SIM" },
  { label: "Não", value: "NAO" },
];

function carregarRegistro(id?: string) {
  try {
    const itens = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as RegistroCessao[];
    return itens.find((item) => item.id === id);
  } catch {
    return undefined;
  }
}

export function PrototiposCessaoCedentePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<RegistroCessao | undefined>(() => carregarRegistro(id));
  const [decisao, setDecisao] = useState<DecisaoCedente | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [erroDecisao, setErroDecisao] = useState("");
  const [mensagemConcluida, setMensagemConcluida] = useState("");
  const { control, watch, setValue } = useForm<AnaliseCedenteForm>({ defaultValues: {
    situacaoFuncional: registro?.analiseCedente?.situacaoFuncional || "",
    semEventoImpeditivo: registro?.analiseCedente?.semEventoImpeditivo || "",
    carreiraPermite: registro?.analiseCedente?.carreiraPermite || "",
    onusConfirmado: registro?.analiseCedente?.onusConfirmado || "",
    compatibilidadeProbatorio: registro?.analiseCedente?.compatibilidadeProbatorio || "",
    manifestacaoLotacao: registro?.documentosCedente?.manifestacaoLotacao || "",
    manifestacaoTecnica: registro?.documentosCedente?.manifestacaoTecnica || "",
    despachoDecisao: registro?.documentosCedente?.despachoDecisao || "",
  }});
  const analise = watch();
  const somenteLeitura = registro?.situacao !== "AGUARDANDO_CEDENTE";
  const verificacoesConcluidas = useMemo(
    () => ["situacaoFuncional", "semEventoImpeditivo", "carreiraPermite", "onusConfirmado", "compatibilidadeProbatorio"]
      .every((campo) => analise[campo as keyof AnaliseCedenteForm] === "SIM"),
    [analise],
  );
  const documentosConcluidos = Boolean(
    analise.manifestacaoLotacao.trim() &&
    analise.manifestacaoTecnica.trim() &&
    analise.despachoDecisao.trim(),
  );
  const podeAutorizar = verificacoesConcluidas && documentosConcluidos && !somenteLeitura;

  const alterar = (campo: keyof AnaliseCedenteForm, valor: string) =>
    setValue(campo, valor);

  const salvarRegistro = (situacao: string, etapaAtual: string, acao: string) => {
    if (!registro) return;
    const atualizado: RegistroCessao = {
      ...registro,
      situacao,
      etapaAtual,
      documentosCedente: {
        manifestacaoLotacao: analise.manifestacaoLotacao.trim(),
        manifestacaoTecnica: analise.manifestacaoTecnica.trim(),
        despachoDecisao: analise.despachoDecisao.trim(),
      },
      analiseCedente: {
        situacaoFuncional: analise.situacaoFuncional,
        semEventoImpeditivo: analise.semEventoImpeditivo,
        carreiraPermite: analise.carreiraPermite,
        onusConfirmado: analise.onusConfirmado,
        compatibilidadeProbatorio: analise.compatibilidadeProbatorio,
      },
      historico: [
        ...(registro.historico || []),
        { data: new Date().toLocaleString("pt-BR"), acao, detalhe: justificativa.trim() || undefined },
      ],
    };
    const itens = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as RegistroCessao[];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens.map((item) => item.id === atualizado.id ? atualizado : item)));
    setRegistro(atualizado);
  };

  const abrirDecisao = (tipo: DecisaoCedente) => {
    setJustificativa("");
    setErroDecisao("");
    setDecisao(tipo);
  };

  const confirmarDecisao = () => {
    if (!registro || !decisao) return;
    if (decisao !== "AUTORIZAR" && !justificativa.trim()) {
      setErroDecisao("Informe a justificativa da decisão.");
      return;
    }
    if (decisao === "INDEFERIR" && !analise.despachoDecisao.trim()) {
      setErroDecisao("Vincule o despacho de indeferimento no SIGADOC.");
      return;
    }
    if (decisao === "AUTORIZAR" && !podeAutorizar) {
      setErroDecisao("Conclua todas as verificações e vincule os documentos obrigatórios.");
      return;
    }

    if (decisao === "DEVOLVER") {
      salvarRegistro("DEVOLVIDA", "Órgão cessionário", "Devolvida para correção pelo órgão cedente");
      setMensagemConcluida("A solicitação foi devolvida ao órgão cessionário para correção.");
    } else if (decisao === "INDEFERIR") {
      salvarRegistro("INDEFERIDA", "Processo encerrado", "Indeferida pelo órgão cedente");
      setMensagemConcluida("A solicitação foi indeferida pelo órgão cedente.");
    } else {
      salvarRegistro("AGUARDANDO_SEPLAG", "SEPLAG", "Autorizada pelo órgão cedente e encaminhada à SEPLAG");
      setMensagemConcluida("A cessão foi autorizada pelo órgão cedente e encaminhada à SEPLAG.");
    }
    setDecisao(null);
  };

  if (!registro) {
    return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white">
        <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: "Análise do cedente" }]} />
        <CardSeplag title="Solicitação não encontrada" cols="12"><div className="col-12 prototype-cedente-empty"><i className="pi pi-exclamation-circle" /><p>Não foi possível localizar esta solicitação no protótipo.</p><BotaoVoltarSeplag label="Voltar para cessões" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /></div></CardSeplag>
      </div>
    </PrototypeSystemPage>;
  }

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-cedente-page">
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: registro.id }, { label: "Análise do cedente" }]} />
      <CardSeplag title="Análise da cessão pelo órgão cedente" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
        <div className="col-12 prototype-cedente-content">
          <div className="prototype-cedente-heading"><div><span>{registro.id}</span><h3>{registro.servidor}</h3><p>Matrícula(s): {registro.matricula}</p></div><BadgeSeplag label={registro.situacao === "AGUARDANDO_CEDENTE" ? "Aguardando análise do cedente" : registro.etapaAtual} color="#8a5c00" bg="#fff1cf" border="transparent" size="sm" /></div>

          <section className="prototype-cedente-section"><header><div><i className="pi pi-eye" /><span><h4>Dados recebidos do cessionário</h4><p>Informações somente para conferência. Eventuais ajustes devem ser devolvidos ao solicitante.</p></span></div></header><dl className="prototype-cedente-summary">
            <div><dt>Cessionário</dt><dd>{registro.orgaoCessionario}</dd></div><div><dt>Cedente</dt><dd>{registro.orgaoCedente}</dd></div><div><dt>Tipo</dt><dd>{registro.tipo === "INTERNA" ? "Cessão interna" : "Cessão externa"}</dd></div>
            <div><dt>Unidade de exercício</dt><dd>{registro.unidadeDestino || "Não informada"}</dd></div><div><dt>Hipótese</dt><dd>{registro.hipotese || "Não informada"}</dd></div><div><dt>Período</dt><dd>{registro.inicio} a {registro.fim}</dd></div>
            <div><dt>Ônus</dt><dd>Órgão cessionário — sem reembolso</dd></div><div><dt>Cargo ou função</dt><dd>{registro.cargoComissionado === "SIM" ? registro.cargoFuncao || "Sim — não especificado" : "Não"}</dd></div><div><dt>Processo SIGADOC</dt><dd>{registro.processoSigadoc || "Não vinculado"}</dd></div>
            <div className="is-wide"><dt>Atividades</dt><dd>{registro.atividades || "Não informadas"}</dd></div><div className="is-wide"><dt>Motivação</dt><dd>{registro.motivacao || "Não informada"}</dd></div>
          </dl></section>

          <section className="prototype-cedente-section"><header><div><i className="pi pi-verified" /><span><h4>Análise funcional</h4><p>Registre as verificações realizadas pela Unidade Sistêmica de Gestão de Pessoas.</p></span></div></header><div className="grid prototype-cedente-checks">
            <RadioButtonFieldSeplag name="situacaoFuncional" control={control} label="Situação funcional regular?" options={opcoesValidacao} required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <RadioButtonFieldSeplag name="semEventoImpeditivo" control={control} label="Sem evento concomitante impeditivo?" options={opcoesValidacao} required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <RadioButtonFieldSeplag name="carreiraPermite" control={control} label="A carreira permite a cessão?" options={opcoesValidacao} required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <RadioButtonFieldSeplag name="onusConfirmado" control={control} label="Ônus e eventual exceção conferidos?" options={opcoesValidacao} required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <RadioButtonFieldSeplag name="compatibilidadeProbatorio" control={control} label="Compatibilidade de atribuições verificada?" options={opcoesValidacao} required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
          </div><div className="prototype-cedente-note"><i className="pi pi-info-circle" /> Para servidor em estágio probatório, a compatibilidade das atribuições é condição expressa do manual.</div></section>

          <section className="prototype-cedente-section"><header><div><i className="pi pi-paperclip" /><span><h4>Documentos do órgão cedente</h4><p>Informe as referências dos documentos produzidos no SIGADOC.</p></span></div></header><div className="grid prototype-cedente-documents">
            <TextFieldSeplag name="manifestacaoLotacao" label="Manifestação da unidade de lotação" value={analise.manifestacaoLotacao} onChange={(valor) => alterar("manifestacaoLotacao", valor)} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <TextFieldSeplag name="manifestacaoTecnica" label="Manifestação técnica da área setorial" value={analise.manifestacaoTecnica} onChange={(valor) => alterar("manifestacaoTecnica", valor)} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
            <TextFieldSeplag name="despachoDecisao" label="Despacho do dirigente máximo" value={analise.despachoDecisao} onChange={(valor) => alterar("despachoDecisao", valor)} placeholder="Número ou referência SIGADOC" required disabled={somenteLeitura} cols="12 6" getFormErrorMessage={() => null} />
          </div></section>

          <div className="prototype-cedente-actions"><BotaoVoltarSeplag label="Voltar" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /><div>{!somenteLeitura && <><BotaoVoltarSeplag label="Devolver para correção" icon="pi pi-replay" onClick={() => abrirDecisao("DEVOLVER")} /><BotaoVoltarSeplag label="Indeferir" icon="pi pi-times" onClick={() => abrirDecisao("INDEFERIR")} /><BotaoSalvarSeplag label="Autorizar e encaminhar à SEPLAG" icon="pi pi-send" disabled={!podeAutorizar} tooltip={!podeAutorizar ? "Conclua as verificações e os documentos obrigatórios." : undefined} onClick={() => abrirDecisao("AUTORIZAR")} /></>}</div></div>
        </div>
      </CardSeplag>

      <ModalSeplag visible={Boolean(decisao)} titulo={decisao === "DEVOLVER" ? "Devolver para correção" : decisao === "INDEFERIR" ? "Indeferir solicitação" : "Autorizar cessão"} tamanho="38rem" fechar={() => setDecisao(null)} labelFechar="Cancelar" labelAcao={decisao === "AUTORIZAR" ? "Autorizar e encaminhar" : decisao === "INDEFERIR" ? "Indeferir" : "Devolver"} iconAcao={decisao === "AUTORIZAR" ? "pi pi-send" : "pi pi-check"} funcAcao={confirmarDecisao}>
        <div className="grid prototype-cedente-decision-modal">
          {decisao === "AUTORIZAR" ? <div className="col-12 prototype-cedente-confirm"><i className="pi pi-info-circle" /><span>Ao confirmar, o processo será encaminhado para análise da SEPLAG.</span></div> : <TextAreaFieldSeplag name="justificativaDecisao" label="Justificativa" value={justificativa} onChange={(valor) => { setJustificativa(valor); setErroDecisao(""); }} rows={4} maxLength={1000} required cols="12" getFormErrorMessage={() => erroDecisao || null} />}
          {erroDecisao && decisao === "AUTORIZAR" && <small className="col-12 p-error">{erroDecisao}</small>}
        </div>
      </ModalSeplag>

      <ModalSeplag visible={Boolean(mensagemConcluida)} titulo="Decisão registrada" tamanho="36rem" fechar={() => navigate("/prototipos/sigep/movimentacao/cessoes")} customFooter={<BotaoSalvarSeplag label="Voltar para cessões" icon="pi pi-arrow-right" iconPos="right" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} />}>
        <div className="prototype-cedente-result"><i className="pi pi-check-circle" /><p>{mensagemConcluida}</p></div>
      </ModalSeplag>
    </div>
  </PrototypeSystemPage>;
}

