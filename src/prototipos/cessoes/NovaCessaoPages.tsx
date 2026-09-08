import { 
  useState } from "react";
import { 
  useForm } from "react-hook-form";
import { 
  useNavigate } from "react-router-dom";
import {
  
  AccordionCardSeplag,BotaoSalvarSeplag,
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
const hipoteseOptions = [
  { label: "Exercício de cargo em comissão ou função de confiança", value: "CARGO" },
  { label: "Situação de comprovado interesse público", value: "INTERESSE_PUBLICO" },
  { label: "Caso previsto em lei específica", value: "LEI_ESPECIFICA" },
];

export function PrototiposNovaCessaoInternaPage() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<EtapaCessao>("servidor");
  const [maiorEtapaLiberada, setMaiorEtapaLiberada] = useState(0);
  const [resumoAberto, setResumoAberto] = useState(true);
  const { control, watch, handleSubmit, setValue } = useForm<NovaCessaoInternaForm>({ defaultValues: { servidor: "", vinculosSelecionados: [], opcaoRemuneratoria: "", vinculoRemuneratorio: "", unidadeDestino: "", codigoUnidade: "", hipotese: "", cargoComissionado: "", cargoFuncao: "", atividades: "", motivacao: "", inicio: "", fim: "" } });
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
  const etapasVisiveis = etapas.map((item, index) => ({
    ...item,
    icon: index < indice ? "pi pi-check-circle" : item.icon,
    disabled: index > maiorEtapaLiberada,
  }));
  const avancar = () => {
    const proximaEtapa = Math.min(indice + 1, etapas.length - 1);
    setMaiorEtapaLiberada((atual) => Math.max(atual, proximaEtapa));
    setEtapa(etapas[proximaEtapa].value);
  };
  const voltar = () => indice === 0 ? navigate("/prototipos/sigep/movimentacao/cessoes") : setEtapa(etapas[indice - 1].value);
  const enviar = handleSubmit(() => { window.alert("Solicitação de cessão interna enviada ao órgão cedente."); navigate("/prototipos/sigep/movimentacao/cessoes"); });

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-nova-cessao-page">
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: "Nova solicitação" }, { label: "Interna" }]} />
      <CardSeplag title="Nova solicitação de cessão interna" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
        <div className="col-12 prototype-nova-cessao-content">
          <p className="prototype-nova-cessao-support">Informe os dados necessários para encaminhar o pedido ao órgão cedente.</p>
          <div className="prototype-nova-cessao-notice"><i className="pi pi-info-circle" /><span>Cessão interna: movimentação entre órgãos ou entidades do Poder Executivo Estadual.</span></div>
          <TabsSeplag items={etapasVisiveis} activeValue={etapa} onChange={setEtapa} equalWidth className="prototype-nova-cessao-tabs" />

          <form onSubmit={enviar}>
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
                <h3>Dados da cessão</h3><p>O manual exige motivação, período e definição do ônus.</p>
                <div className="grid"><DropdownFieldSeplag name="hipotese" control={control} label="Hipótese da cessão" options={doisVinculos ? hipoteseOptions.filter((item) => item.value === "CARGO") : hipoteseOptions} optionLabel="label" optionValue="value" required cols="12 6" getFormErrorMessage={erro} /><TextFieldSeplag name="onus" label="Ônus" value="Órgão cessionário — sem reembolso" disabled cols="12 6" getFormErrorMessage={erro} /><DateFieldSeplag name="inicio" control={control} label="Data inicial" required cols="12 6 3" getFormErrorMessage={erro} /><DateFieldSeplag name="fim" control={control} label="Data final" required validateAfterDate={valores.inicio} cols="12 6 3" getFormErrorMessage={erro} /><TextAreaFieldSeplag name="atividades" control={control} label="Atividades que serão exercidas" required rows={3} maxLength={1000} cols="12" getFormErrorMessage={erro} /><TextAreaFieldSeplag name="motivacao" control={control} label="Motivação do pedido" required rows={4} maxLength={2000} cols="12" getFormErrorMessage={erro} /></div>
                <div className="prototype-nova-cessao-warning"><i className="pi pi-clock" /> O pedido deve ser protocolado com antecedência mínima de 60 dias e o período não pode ultrapassar cinco anos.</div>
              </>}
              {etapa === "documentos" && <>
                <h3>Documentos</h3><p>A instrução oficial ocorre no SIGADOC. Nesta etapa ficam registrados os documentos sob responsabilidade do solicitante.</p>
                <div className="prototype-nova-cessao-docs"><article><i className="pi pi-file" /><span><strong>Ofício de solicitação de cessão interna</strong><small>Obrigatório na abertura.</small></span><button type="button">Vincular documento</button></article><article className="is-future"><i className="pi pi-lock" /><span><strong>Manifestação da unidade de lotação</strong><small>Será produzida durante a instrução pelo órgão cedente.</small></span><em>Etapa do cedente</em></article><article className="is-future"><i className="pi pi-lock" /><span><strong>Manifestação técnica do órgão central</strong><small>Será produzida após a autorização do cedente.</small></span><em>Etapa da SEPLAG</em></article></div>
              </>}
              {etapa === "revisao" && <>
                <h3>Revisão e envio</h3><p>Confira as informações antes de encaminhar ao órgão cedente.</p>
                <dl className="prototype-nova-cessao-summary"><div><dt>Tipo</dt><dd>Cessão interna</dd></div><div><dt>Servidor</dt><dd>{servidor?.nome || "Não informado"}</dd></div><div><dt>Vínculo(s)</dt><dd>{vinculosSelecionados.length ? vinculosSelecionados.map((item) => item.matricula).join(" e ") : "Não informado"}</dd></div><div><dt>Cedente(s)</dt><dd>{vinculosSelecionados.length ? [...new Set(vinculosSelecionados.map((item) => item.cedente))].join(" e ") : "Não informado"}</dd></div><div><dt>Cessionário</dt><dd>SEPLAG</dd></div><div><dt>Unidade de exercício</dt><dd>{unidadeDestinoSelecionada || "Não informada"}</dd></div><div><dt>Período</dt><dd>{valores.inicio && valores.fim ? `${valores.inicio} a ${valores.fim}` : "Não informado"}</dd></div><div><dt>Ônus</dt><dd>Órgão cessionário — sem reembolso</dd></div></dl>
                <div className="prototype-nova-cessao-declaration"><i className="pi pi-exclamation-triangle" /><span>Após o envio, a solicitação ficará aguardando a instrução e a decisão do órgão cedente.</span></div>
              </>}
            </section>
            <div className="prototype-nova-cessao-footer"><BotaoVoltarSeplag label={indice === 0 ? "Cancelar" : "Voltar"} icon={indice === 0 ? "pi pi-times" : "pi pi-arrow-left"} onClick={voltar} /><div><BotaoSalvarSeplag type="button" label="Salvar rascunho" icon="pi pi-save" onClick={() => window.alert("Rascunho salvo no protótipo.")} />{etapa === "revisao" ? <BotaoSalvarSeplag type="submit" label="Enviar ao órgão cedente" icon="pi pi-send" /> : <BotaoSalvarSeplag type="button" label="Continuar" icon="pi pi-arrow-right" iconPos="right" onClick={avancar} />}</div></div>
          </form>
        </div>
      </CardSeplag>
    </div>
  </PrototypeSystemPage>;
}

export function PrototiposNovaCessaoExternaPage() {
  const navigate = useNavigate();
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><div className="prototype-page-content prototype-page-content--white"><BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }, { label: "Nova solicitação" }, { label: "Externa" }]} /><CardSeplag title="Nova solicitação de cessão externa" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card"><div className="col-12 prototype-nova-cessao-placeholder"><i className="pi pi-info-circle" /><h3>Tela reservada</h3><p>O fluxo específico da cessão externa será detalhado antes da implementação.</p><BotaoVoltarSeplag label="Voltar para cessões" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes")} /></div></CardSeplag></div></PrototypeSystemPage>;
}