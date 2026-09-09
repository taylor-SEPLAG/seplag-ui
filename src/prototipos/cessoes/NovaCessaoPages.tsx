import { 
  useState } from "react";
import { 
  useForm } from "react-hook-form";
import { 
  useNavigate, useParams } from "react-router-dom";
import {
  
  AccordionCardSeplag,
  ModalSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BreadcrumbSeplag,
  CardSeplag,
  DateFieldSeplag,
  DropdownFieldSeplag,
  MultiSelectFieldSeplag,
  RadioButtonFieldSeplag,
  TabsSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "../../componentes";
import { 
  PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./novaCessao.css";

type EtapaCessao = "servidor" | "destino" | "dados" | "documentos" | "revisao";
interface NovaCessaoInternaForm {
  servidor: string;
  vinculosSelecionados: string[];
  opcaoRemuneratoria: string;
  vinculoRemuneratorio: string;
  unidadeDestino: string;
  codigoUnidade: string;
  hipotese: string;
  cargoComissionado: string;
  cargoFuncao: string;
  atividades: string;
  motivacao: string;
  inicio: string;
  fim: string;
}

const etapas: Array<{ label: string; value: EtapaCessao; icon: string }> = [
  { label: "1. Servidor", value: "servidor", icon: "pi pi-user" },
  { label: "2. Destino", value: "destino", icon: "pi pi-building" },
  { label: "3. Dados da cessão", value: "dados", icon: "pi pi-file-edit" },
  { label: "4. Documentos", value: "documentos", icon: "pi pi-paperclip" },
  { label: "5. Revisão", value: "revisao", icon: "pi pi-check-circle" },
];
interface VinculoServidor {
  matricula: string;
  cargo: string;
  carreira: string;
  cargaHoraria: string;
  cedente: string;
  lotacao: string;
  probatorio: string;
}
interface ServidorCessao {
  nome: string;
  cpf: string;
  vinculos: VinculoServidor[];
}
const servidorOptions = [
  { label: "Maria Aparecida Silva", value: "maria" },
  { label: "Carlos Eduardo Mendes", value: "carlos" },
  { label: "Rafael Martins Costa", value: "rafael" },
];
const servidorDetalhes: Record<string, ServidorCessao> = {
  maria: {
    nome: "Maria Aparecida Silva",
    cpf: "123.456.789-00",
    vinculos: [
      { matricula: "123456", cargo: "Analista Administrativo", carreira: "Área Instrumental", cargaHoraria: "40 horas", cedente: "SEFAZ", lotacao: "Coordenadoria Administrativa", probatorio: "Não" },
      { matricula: "654321", cargo: "Professora da Educação Básica", carreira: "Educação Básica", cargaHoraria: "20 horas", cedente: "SEDUC", lotacao: "Escola Estadual Pedro II", probatorio: "Não" },
      { matricula: "789012", cargo: "Técnica Administrativa", carreira: "Apoio Administrativo", cargaHoraria: "20 horas", cedente: "SEPLAG", lotacao: "Gerência de Atendimento", probatorio: "Não" },
    ],
  },
  carlos: {
    nome: "Carlos Eduardo Mendes",
    cpf: "987.654.321-00",
    vinculos: [
      { matricula: "741852", cargo: "Técnico Administrativo", carreira: "Área Instrumental", cargaHoraria: "40 horas", cedente: "SES", lotacao: "Gerência de Apoio", probatorio: "Não" },
    ],
  },
  rafael: {
    nome: "Rafael Martins Costa",
    cpf: "456.789.123-00",
    vinculos: [
      { matricula: "852147", cargo: "Auditor", carreira: "Controle Interno", cargaHoraria: "40 horas", cedente: "CGE", lotacao: "Unidade de Auditoria", probatorio: "Sim" },
    ],
  },
};
const unidadeOptions = [
  { label: "Gabinete do Secretário — UO 001", value: "001" },
  { label: "Superintendência de Gestão de Pessoas — UO 120", value: "120" },
  { label: "Coordenadoria de Movimentação — UO 124", value: "124" },
];
const REGISTROS_CESSAO_STORAGE_KEY = "sigep-prototype-cessoes-registros";
interface RegistroCessaoCorrecao {
  id: string; servidor: string; matricula: string; tipo: string; orgaoCedente: string; orgaoCessionario: string;
  inicio: string; fim: string; etapaAtual: string; situacao: string; processoSigadoc?: string; unidadeDestino?: string;
  hipotese?: string; atividades?: string; motivacao?: string; cargoComissionado?: string; cargoFuncao?: string;
  analiseCedente?: Record<string, string>; historico?: Array<{ data: string; acao: string; detalhe?: string }>;
}
function carregarCessaoCorrecao(id?: string) {
  try { return (JSON.parse(window.localStorage.getItem(REGISTROS_CESSAO_STORAGE_KEY) || "[]") as RegistroCessaoCorrecao[]).find((item) => item.id === id); }
  catch { return undefined; }
}

const hipoteseOptions = [
  { label: "Exercício de cargo em comissão ou função de confiança", value: "CARGO" },
  { label: "Situação de comprovado interesse público", value: "INTERESSE_PUBLICO" },
  { label: "Caso previsto em lei específica", value: "LEI_ESPECIFICA" },
];

export function PrototiposNovaCessaoInternaPage({ modo = "nova" }: { modo?: "nova" | "correcao" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const registroCorrecao = modo === "correcao" ? carregarCessaoCorrecao(id) : undefined;
  const servidorInicial = Object.entries(servidorDetalhes).find(([, item]) => item.nome === registroCorrecao?.servidor)?.[0] || "";
  const matriculasIniciais = registroCorrecao?.matricula.split(/\s+e\s+/).map((item) => item.trim()).filter(Boolean) || [];
  const unidadeInicial = unidadeOptions.find((item) => item.label === registroCorrecao?.unidadeDestino)?.value || "";
  const hipoteseInicial = hipoteseOptions.find((item) => item.label === registroCorrecao?.hipotese)?.value || "";
  const etapasComCorrecao = (["servidor", "destino", "dados", "documentos"] as EtapaCessao[]).filter((item) => registroCorrecao?.analiseCedente?.[`${item}Resultado`] === "CORRECAO");
  const [etapa, setEtapa] = useState<EtapaCessao>(() => etapasComCorrecao[0] || "servidor");
  const [etapasCorrigidas, setEtapasCorrigidas] = useState<EtapaCessao[]>([]);
  const [maiorEtapaLiberada, setMaiorEtapaLiberada] = useState(modo === "correcao" ? 4 : 0);
  const [resumoAberto, setResumoAberto] = useState(true);
  const [modalSigadocAberto, setModalSigadocAberto] = useState(false);
  const [numeroSigadoc, setNumeroSigadoc] = useState(registroCorrecao?.processoSigadoc || "");
  const [sigadocVinculado, setSigadocVinculado] = useState(registroCorrecao?.processoSigadoc || "");
  const [erroSigadoc, setErroSigadoc] = useState("");
  const [modalEnvioConcluido, setModalEnvioConcluido] = useState(false);
  const { control, watch, handleSubmit, setValue } = useForm<NovaCessaoInternaForm>({ defaultValues: { servidor: servidorInicial, vinculosSelecionados: matriculasIniciais, opcaoRemuneratoria: "", vinculoRemuneratorio: "", unidadeDestino: unidadeInicial, codigoUnidade: unidadeInicial, hipotese: hipoteseInicial, cargoComissionado: registroCorrecao?.cargoComissionado || "", cargoFuncao: registroCorrecao?.cargoFuncao || "", atividades: registroCorrecao?.atividades || "", motivacao: registroCorrecao?.motivacao || "", inicio: registroCorrecao?.inicio || "", fim: registroCorrecao?.fim || "" } });
  const valores = watch();
  const servidor = servidorDetalhes[valores.servidor];
  const doisVinculos = (valores.vinculosSelecionados?.length ?? 0) === 2;
  const vinculosSelecionados = servidor
    ? servidor.vinculos.filter((item) => valores.vinculosSelecionados?.includes(item.matricula))
    : [];
  const unidadeDestinoSelecionada = unidadeOptions.find((item) => item.value === valores.unidadeDestino)?.label;
  const hipoteseSelecionada = hipoteseOptions.find((item) => item.value === valores.hipotese)?.label;
  const indice = etapas.findIndex((item) => item.value === etapa);
  const erro = () => null;
  const precisaCorrecao = (item: EtapaCessao) => etapasComCorrecao.includes(item);
  const etapaAprovada = (item: EtapaCessao) => modo === "correcao" && item !== "revisao" && registroCorrecao?.analiseCedente?.[`${item}Resultado`] === "APROVADO";
  const comentarioEtapa = etapa !== "revisao" ? registroCorrecao?.analiseCedente?.[`${etapa}Comentario`] : "";
  const somenteLeitura = etapaAprovada(etapa);
  const correcoesConcluidas = etapasComCorrecao.every((item) => etapasCorrigidas.includes(item));
  const etapasVisiveis = etapas.map((item, index) => ({
    ...item,
    label: modo === "correcao" && precisaCorrecao(item) ? `${item.label} — corrigir` : item.label,
    icon: modo === "correcao" && precisaCorrecao(item) ? (etapasCorrigidas.includes(item) ? "pi pi-check-circle" : "pi pi-exclamation-triangle") : index < indice || etapaAprovada(item) ? "pi pi-check-circle" : item.icon,
    disabled: modo === "nova" && index > maiorEtapaLiberada,
  }));
  const avancar = () => {
    if (modo === "correcao" && etapa !== "revisao" && precisaCorrecao(etapa) && !etapasCorrigidas.includes(etapa)) setEtapasCorrigidas((atual) => [...atual, etapa]);
    const proximaEtapa = Math.min(indice + 1, etapas.length - 1);
    setMaiorEtapaLiberada((atual) => Math.max(atual, proximaEtapa));
    setEtapa(etapas[proximaEtapa].value);
  };
  const voltar = () => indice === 0 ? navigate("/prototipos/sigep/movimentacao/cessoes") : setEtapa(etapas[indice - 1].value);
  const enviar = handleSubmit(() => {
    if (!servidor || !vinculosSelecionados.length || !sigadocVinculado) return;
    let registros: Array<Record<string, unknown>> = [];
    try {
      const salvos = window.localStorage.getItem(REGISTROS_CESSAO_STORAGE_KEY);
      registros = salvos ? JSON.parse(salvos) : [];
    } catch {
      registros = [];
    }
    const proximoNumero = registros.reduce((maior, item) => {
      const numero = Number(String(item.id ?? "").match(/(\d+)$/)?.[1] ?? 0);
      return Math.max(maior, numero);
    }, 0) + 1;
    const cedentes = [...new Set(vinculosSelecionados.map((item) => item.cedente))];
    const dadosAtualizados = {
      servidor: servidor.nome, matricula: vinculosSelecionados.map((item) => item.matricula).join(" e "), tipo: "INTERNA",
      orgaoCedente: cedentes.join(" / "), orgaoCessionario: "SEPLAG", inicio: valores.inicio, fim: valores.fim,
      etapaAtual: modo === "correcao" ? "Órgão cedente — nova análise" : "Órgão cedente", situacao: "AGUARDANDO_CEDENTE",
      processoSigadoc: sigadocVinculado, unidadeDestino: unidadeDestinoSelecionada, hipotese: hipoteseSelecionada,
      atividades: valores.atividades, motivacao: valores.motivacao, cargoComissionado: valores.cargoComissionado, cargoFuncao: valores.cargoFuncao,
    };
    if (modo === "correcao" && registroCorrecao) {
      const analiseCedente = { ...(registroCorrecao.analiseCedente || {}) };
      (["servidor", "destino", "dados", "documentos"] as EtapaCessao[]).forEach((item) => {
        analiseCedente[`${item}Resultado`] = "REVISAR";
        analiseCedente[`${item}Comentario`] = "";
      });
      const atualizado = { ...registroCorrecao, ...dadosAtualizados, analiseCedente, historico: [...(registroCorrecao.historico || []), { data: new Date().toLocaleString("pt-BR"), acao: "Correções realizadas e solicitação reenviada ao órgão cedente", detalhe: etapasComCorrecao.join(", ") }] };
      registros = registros.map((item) => item.id === registroCorrecao.id ? atualizado : item);
    } else {
      registros.push({ id: `CES-${new Date().getFullYear()}-${String(proximoNumero).padStart(4, "0")}`, ...dadosAtualizados });
    }
    window.localStorage.setItem(REGISTROS_CESSAO_STORAGE_KEY, JSON.stringify(registros));
    setModalEnvioConcluido(true);
  });
  const concluirEnvio = () => {
    setModalEnvioConcluido(false);
    navigate("/prototipos/sigep/movimentacao/cessoes");
  };
  const abrirVinculoSigadoc = () => {
    setNumeroSigadoc(sigadocVinculado);
    setErroSigadoc("");
    setModalSigadocAberto(true);
  };
  const vincularSigadoc = () => {
    const numero = numeroSigadoc.trim();
    if (!numero) { setErroSigadoc("Informe o número do processo SIGADOC."); return; }
    setSigadocVinculado(numero);
    setErroSigadoc("");
    setModalSigadocAberto(false);
  };

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-nova-cessao-page">
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={modo === "correcao" ? [{ label: "Movimentação" }, { label: "Cessão" }, { label: registroCorrecao?.id || "Solicitação" }, { label: "Corrigir solicitação" }] : [{ label: "Movimentação" }, { label: "Cessão" }, { label: "Nova solicitação" }, { label: "Interna" }]} />
      <CardSeplag title={modo === "correcao" ? "Cessão interna" : "Nova solicitação de cessão interna"} cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
        <div className="col-12 prototype-nova-cessao-content">
          <p className="prototype-nova-cessao-support">{modo === "correcao" ? "Corrija as etapas indicadas pelo órgão cedente e revise as alterações antes do reenvio." : "Informe os dados necessários para encaminhar o pedido ao órgão cedente."}</p>
          <div className="prototype-nova-cessao-notice"><i className="pi pi-info-circle" /><span>Cessão interna: movimentação entre órgãos ou entidades do Poder Executivo Estadual.</span></div>
          {modo === "correcao" && <div className="prototype-nova-cessao-correction-status"><i className="pi pi-replay" /><span><strong>Devolvida</strong><small>{registroCorrecao?.id} • {registroCorrecao?.servidor}</small></span></div>}
          <TabsSeplag items={etapasVisiveis} activeValue={etapa} onChange={setEtapa} equalWidth className="prototype-nova-cessao-tabs" />

          <div>
            {indice > 0 && etapa !== "revisao" && <div className="prototype-nova-cessao-progress-summary">
              <AccordionCardSeplag title="Resumo das etapas concluídas" iconTitulo="pi pi-check-circle" isOpen={resumoAberto} showIcon onToggle={() => setResumoAberto((aberto) => !aberto)}>
                <div className="prototype-nova-cessao-progress-content">
                  <article>
                    <div><strong>1. Servidor</strong><span>{servidor?.nome || "Não informado"} • {vinculosSelecionados.length ? vinculosSelecionados.map((item) => "Matrícula " + item.matricula).join(" e ") : "vínculo não informado"}</span></div>
                    <button type="button" onClick={() => setEtapa("servidor")}><i className="pi pi-pencil" /> Editar</button>
                  </article>
                  {indice > 1 && <article>
                    <div><strong>2. Destino</strong><span>SEPLAG • {unidadeDestinoSelecionada || "unidade não informada"}{valores.cargoComissionado === "SIM" ? " • Cargo em comissão" : ""}</span></div>
                    <button type="button" onClick={() => setEtapa("destino")}><i className="pi pi-pencil" /> Editar</button>
                  </article>}
                  {indice > 2 && <article>
                    <div><strong>3. Dados da cessão</strong><span>{hipoteseSelecionada || "Hipótese não informada"} • {valores.inicio && valores.fim ? valores.inicio + " a " + valores.fim : "período não informado"}</span></div>
                    <button type="button" onClick={() => setEtapa("dados")}><i className="pi pi-pencil" /> Editar</button>
                  </article>}
                </div>
              </AccordionCardSeplag>
            </div>}
            <section className="prototype-nova-cessao-panel">
              {modo === "correcao" && etapa !== "revisao" && precisaCorrecao(etapa) && <div className={etapasCorrigidas.includes(etapa) ? "prototype-nova-cessao-correction-alert is-done" : "prototype-nova-cessao-correction-alert"}><i className={etapasCorrigidas.includes(etapa) ? "pi pi-check-circle" : "pi pi-exclamation-triangle"} /><span><strong>{etapasCorrigidas.includes(etapa) ? "Correção marcada como concluída" : "Correção solicitada pelo órgão cedente"}</strong><small>{comentarioEtapa || "Revise as informações desta etapa."}</small></span></div>}
              {modo === "correcao" && etapa !== "revisao" && etapaAprovada(etapa) && <div className="prototype-nova-cessao-approved"><i className="pi pi-lock" /><span>Etapa aprovada pelo órgão cedente. As informações estão disponíveis somente para consulta.</span></div>}
              <fieldset className="prototype-nova-cessao-shared-fields" disabled={somenteLeitura}>
              {etapa === "servidor" && <>
                <h3>Servidor</h3><p>Selecione o servidor e o vínculo ativo que será abrangido pela cessão.</p>
                <div className="grid"><DropdownFieldSeplag name="servidor" control={control} label="Nome ou matrícula" options={servidorOptions} optionLabel="label" optionValue="value" placeholder="Pesquise o servidor" required cols="12 6" getFormErrorMessage={erro} onChange={() => { setValue("vinculosSelecionados", []); setValue("opcaoRemuneratoria", ""); setValue("vinculoRemuneratorio", ""); }} /></div>
                {servidor && <div className="prototype-nova-cessao-vinculos">
                  <div className="prototype-nova-cessao-person"><span><strong>{servidor.nome}</strong><small>CPF {servidor.cpf}</small></span><em>{servidor.vinculos.length} {servidor.vinculos.length === 1 ? "vínculo ativo" : "vínculos ativos"}</em></div>
                  <MultiSelectFieldSeplag name="vinculosSelecionados" control={control} label="Vínculos abrangidos pela cessão" options={servidor.vinculos.map((vinculo) => ({ label: "Matrícula " + vinculo.matricula + " — " + vinculo.cargo + " • " + vinculo.cedente, value: vinculo.matricula }))} optionLabel="label" optionValue="value" display="chip" selectionLimit={2} maxSelectedLabels={2} placeholder="Selecione até dois vínculos" required cols="12" getFormErrorMessage={erro} />
                  {doisVinculos && <>
                    <div className="prototype-nova-cessao-special-rule"><i className="pi pi-info-circle" /><span><strong>Regra excepcional para dois vínculos</strong><small>Permitida para afastamento de ambos no exercício de cargo em comissão. A opção remuneratória deve constar no processo.</small></span></div>
                    <RadioButtonFieldSeplag name="opcaoRemuneratoria" control={control} label="Opção remuneratória" options={[{ label: "Remuneração integral do cargo em comissão", value: "CARGO_INTEGRAL" }, { label: "Remuneração de um vínculo efetivo acrescida do percentual de comissionamento", value: "EFETIVO_COM_PERCENTUAL" }]} variant="cards" required cols="12" getFormErrorMessage={erro} />
                    {valores.opcaoRemuneratoria === "EFETIVO_COM_PERCENTUAL" && <DropdownFieldSeplag name="vinculoRemuneratorio" control={control} label="Vínculo utilizado para remuneração" options={vinculosSelecionados.map((vinculo) => ({ label: "Matrícula " + vinculo.matricula + " — " + vinculo.cargo, value: vinculo.matricula }))} optionLabel="label" optionValue="value" required cols="12 6" getFormErrorMessage={erro} />}
                  </>}
                </div>}
              </>}
              {etapa === "destino" && <>
                <h3>Destino</h3><p>O órgão cessionário é definido pelo usuário autenticado.</p>
                <div className="grid"><TextFieldSeplag name="orgaoDestino" label="Órgão cessionário" value="SEPLAG" disabled cols="12 6" getFormErrorMessage={erro} /><DropdownFieldSeplag name="unidadeDestino" control={control} label="Unidade de exercício" options={unidadeOptions} optionLabel="label" optionValue="value" required cols="12 6" getFormErrorMessage={erro} onChange={() => undefined} /><TextFieldSeplag name="codigoUnidade" label="Código da unidade" value={valores.unidadeDestino} disabled cols="12 4" getFormErrorMessage={erro} /><RadioButtonFieldSeplag name="cargoComissionado" control={control} label="Exercerá cargo em comissão ou função de confiança?" options={[{ label: "Sim", value: "SIM" }, { label: "Não", value: "NAO", disabled: doisVinculos }]} required cols="12 8" getFormErrorMessage={erro} />{valores.cargoComissionado === "SIM" && <TextFieldSeplag name="cargoFuncao" control={control} label="Cargo ou função" required cols="12 6" getFormErrorMessage={erro} />}</div>
              </>}
              {etapa === "dados" && <>
                <h3>Dados da cessão</h3><p>A cessão exige motivação, período e definição do ônus.</p>
                <div className="grid"><DropdownFieldSeplag name="hipotese" control={control} label="Hipótese da cessão" options={doisVinculos ? hipoteseOptions.filter((item) => item.value === "CARGO") : hipoteseOptions} optionLabel="label" optionValue="value" required cols="12 6" getFormErrorMessage={erro} /><TextFieldSeplag name="onus" label="Ônus" value="Órgão cessionário — sem reembolso" disabled cols="12 6" getFormErrorMessage={erro} /><DateFieldSeplag name="inicio" control={control} label="Data inicial" required cols="12 6 3" getFormErrorMessage={erro} /><DateFieldSeplag name="fim" control={control} label="Data final" required validateAfterDate={valores.inicio} cols="12 6 3" getFormErrorMessage={erro} /><TextAreaFieldSeplag name="atividades" control={control} label="Atividades que serão exercidas" required rows={3} maxLength={1000} cols="12" getFormErrorMessage={erro} /><TextAreaFieldSeplag name="motivacao" control={control} label="Motivação do pedido" required rows={4} maxLength={2000} cols="12" getFormErrorMessage={erro} /></div>
                <div className="prototype-nova-cessao-warning"><i className="pi pi-clock" /> O pedido deve ser protocolado com antecedência mínima de 60 dias e o período não pode ultrapassar cinco anos.</div>
              </>}
              {etapa === "documentos" && <>
                <h3>Documentos</h3><p>A instrução oficial ocorre no SIGADOC. Nesta etapa ficam registrados os documentos sob responsabilidade do solicitante.</p>
                <div className="prototype-nova-cessao-docs">
                  <article className={sigadocVinculado ? "is-linked" : undefined}><i className={sigadocVinculado ? "pi pi-check-circle" : "pi pi-file"} /><span><strong>1. Ofício de solicitação de cessão interna</strong><small>{sigadocVinculado ? <>Processo SIGADOC: <b>{sigadocVinculado}</b></> : "Pedido formal do órgão cessionário. Obrigatório na abertura."}</small></span><button type="button" onClick={abrirVinculoSigadoc}>{sigadocVinculado ? "Alterar vínculo" : "Vincular documento"}</button></article>
                  <article className="is-future"><i className="pi pi-lock" /><span><strong>2. Solicitação de manifestação da unidade de lotação</strong><small>Despacho opcional para solicitar o posicionamento da unidade onde o servidor está lotado.</small></span><em>Etapa do Cedente • Opcional</em></article>
                  <article className="is-future"><i className="pi pi-lock" /><span><strong>3. Manifestação da unidade de lotação</strong><small>Posicionamento da unidade sobre a liberação do servidor e seus impactos.</small></span><em>Etapa do Cedente</em></article>
                  <article className="is-future"><i className="pi pi-lock" /><span><strong>4. Manifestação técnica da área setorial</strong><small>Análise da Gestão de Pessoas do órgão cedente sobre a regularidade da cessão.</small></span><em>Etapa do Cedente</em></article>
                  <article className="is-future"><i className="pi pi-lock" /><span><strong>5. Despacho de autorização ou indeferimento</strong><small>Decisão formal do dirigente máximo do órgão cedente.</small></span><em>Etapa do Cedente</em></article>
                  <article className="is-future"><i className="pi pi-lock" /><span><strong>6. Manifestação técnica do órgão central</strong><small>Análise final da SEPLAG antes da publicação do ato administrativo.</small></span><em>Etapa da SEPLAG</em></article>
                </div>
              </>}
              {etapa === "revisao" && <>
                <h3>Revisão e envio</h3><p>Confira as informações antes de encaminhar ao órgão cedente.</p>
                <div className="prototype-nova-cessao-review">
                  <section><header><h4>1. Servidor</h4><button type="button" onClick={() => setEtapa("servidor")}><i className="pi pi-pencil" /> Editar</button></header><dl><div><dt>Servidor</dt><dd>{servidor?.nome || "Não informado"}</dd></div><div><dt>Matrícula(s)</dt><dd>{vinculosSelecionados.length ? vinculosSelecionados.map((item) => item.matricula).join(" e ") : "Não informada"}</dd></div><div><dt>Cedente(s)</dt><dd>{vinculosSelecionados.length ? [...new Set(vinculosSelecionados.map((item) => item.cedente))].join(" e ") : "Não informado"}</dd></div></dl></section>
                  <section><header><h4>2. Destino</h4><button type="button" onClick={() => setEtapa("destino")}><i className="pi pi-pencil" /> Editar</button></header><dl><div><dt>Cessionário</dt><dd>SEPLAG</dd></div><div><dt>Unidade de exercício</dt><dd>{unidadeDestinoSelecionada || "Não informada"}</dd></div><div><dt>Cargo em comissão ou função de confiança</dt><dd>{valores.cargoComissionado === "SIM" ? "Sim" : valores.cargoComissionado === "NAO" ? "Não" : "Não informado"}</dd></div>{valores.cargoComissionado === "SIM" && <div><dt>Cargo ou função</dt><dd>{valores.cargoFuncao || "Não informado"}</dd></div>}</dl></section>
                  <section><header><h4>3. Dados da cessão</h4><button type="button" onClick={() => setEtapa("dados")}><i className="pi pi-pencil" /> Editar</button></header><dl><div><dt>Hipótese</dt><dd>{hipoteseSelecionada || "Não informada"}</dd></div><div><dt>Período</dt><dd>{valores.inicio && valores.fim ? `${valores.inicio} a ${valores.fim}` : "Não informado"}</dd></div><div><dt>Ônus</dt><dd>Órgão cessionário — sem reembolso</dd></div><div className="is-wide"><dt>Atividades que serão exercidas</dt><dd>{valores.atividades || "Não informadas"}</dd></div><div className="is-wide"><dt>Motivação do pedido</dt><dd>{valores.motivacao || "Não informada"}</dd></div></dl></section>
                  <section><header><h4>4. Documentos</h4><button type="button" onClick={() => setEtapa("documentos")}><i className="pi pi-pencil" /> Editar</button></header><dl><div><dt>Documento</dt><dd>Ofício de solicitação de cessão interna</dd></div><div><dt>Processo SIGADOC</dt><dd>{sigadocVinculado || "Não vinculado"}</dd></div><div><dt>Situação</dt><dd className={sigadocVinculado ? "is-success" : "is-pending"}>{sigadocVinculado ? "Vinculado" : "Pendente"}</dd></div></dl></section>
                </div>
                <div className="prototype-nova-cessao-declaration"><i className="pi pi-exclamation-triangle" /><span>Após o envio, a solicitação ficará aguardando a instrução e a decisão do órgão cedente.</span></div>
              </>}
            </fieldset>
            </section>
            <div className="prototype-nova-cessao-footer"><BotaoVoltarSeplag label={indice === 0 ? (modo === "correcao" ? "Voltar para cessões" : "Cancelar") : "Voltar"} icon={indice === 0 ? (modo === "correcao" ? "pi pi-arrow-left" : "pi pi-times") : "pi pi-arrow-left"} onClick={voltar} /><div><BotaoSalvarSeplag type="button" label={modo === "correcao" ? "Salvar correções" : "Salvar rascunho"} icon="pi pi-save" onClick={() => window.alert(modo === "correcao" ? "Correções salvas no protótipo." : "Rascunho salvo no protótipo.")} />{etapa === "revisao" ? <BotaoSalvarSeplag type="button" label={modo === "correcao" ? "Reenviar ao órgão cedente" : "Enviar ao órgão cedente"} icon="pi pi-send" disabled={!sigadocVinculado || (modo === "correcao" && !correcoesConcluidas)} tooltip={!sigadocVinculado ? "Vincule o processo SIGADOC antes do envio." : modo === "correcao" && !correcoesConcluidas ? "Conclua todas as etapas devolvidas antes do reenvio." : undefined} onClick={() => void enviar()} /> : <BotaoSalvarSeplag type="button" label={modo === "correcao" && precisaCorrecao(etapa) ? "Marcar como corrigida e continuar" : "Continuar"} icon="pi pi-arrow-right" iconPos="right" onClick={avancar} />}</div></div>
          </div>
        </div>
      </CardSeplag>
      <ModalSeplag
        visible={modalSigadocAberto}
        titulo="Vincular documento do SIGADOC"
        tamanho="32rem"
        fechar={() => setModalSigadocAberto(false)}
        labelFechar="Cancelar"
        labelAcao="Vincular"
        funcAcao={vincularSigadoc}
      >
        <div className="grid prototype-nova-cessao-sigadoc-modal">
          <TextFieldSeplag
            name="processoSigadoc"
            label="Processo SIGADOC"
            value={numeroSigadoc}
            onChange={(valor) => {
              setNumeroSigadoc(valor);
              if (erroSigadoc) setErroSigadoc("");
            }}
            placeholder="Ex.: SEMA-PRO-2026/03081"
            required
            cols="12"
            getFormErrorMessage={() => erroSigadoc || null}
          />
          <small className="col-12">
            O número é informado manualmente neste protótipo. Uma integração com o SIGADOC poderá automatizar a consulta e a vinculação no futuro.
          </small>
        </div>
      </ModalSeplag>
      <ModalSeplag
        visible={modalEnvioConcluido}
        titulo={modo === "correcao" ? "Solicitação reenviada" : "Solicitação enviada"}
        tamanho="34rem"
        fechar={concluirEnvio}
        customFooter={<BotaoSalvarSeplag type="button" label="Voltar para cessões" icon="pi pi-arrow-right" iconPos="right" onClick={concluirEnvio} />}
      >
        <div className="prototype-nova-cessao-success-modal">
          <i className="pi pi-check-circle" aria-hidden="true" />
          <div>
            <strong>{modo === "correcao" ? "Correções enviadas ao órgão cedente" : "Solicitação enviada ao órgão cedente"}</strong>
            <p>{modo === "correcao" ? "As etapas corrigidas ficarão aguardando nova análise do órgão cedente." : "O pedido foi encaminhado e ficará aguardando a instrução e a decisão do órgão cedente."}</p>
            <small>Processo SIGADOC: {sigadocVinculado}</small>
          </div>
        </div>
      </ModalSeplag>
    </div>
  </PrototypeSystemPage>;
}

export function PrototiposNovaCessaoExternaPage() {
  const navigate = useNavigate();
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><div className="prototype-page-content prototype-page-content--white"><BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: "Nova solicitação" }, { label: "Externa" }]} /><CardSeplag title="Nova solicitação de cessão externa" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card"><div className="col-12 prototype-nova-cessao-placeholder"><i className="pi pi-info-circle" /><h3>Tela reservada</h3><p>O fluxo específico da cessão externa será detalhado antes da implementação.</p><BotaoVoltarSeplag label="Voltar para cessões" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /></div></CardSeplag></div></PrototypeSystemPage>;
}









