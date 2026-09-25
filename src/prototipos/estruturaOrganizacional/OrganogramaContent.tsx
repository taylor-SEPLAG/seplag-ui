import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DateFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { ModalSeplag } from "@componentes/Modal";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "@interfaces/Results";
import { cadastrarOrganograma, cadastrarUnidadeNoOrganograma, lerEstruturaOrganizacional, obterUnidadesDaVersao, obterVersaoVigente, publicarOrganograma, vincularUnidadeAoOrganograma, type VersaoOrganograma, type UnidadeNoOrganograma } from "./estruturaOrganizacionalStore";
import { tiposUnidadesAtivos } from "./tiposUnidadesStore";
import "./organograma.css";

type Unidade = UnidadeNoOrganograma;

type Filtros = {
  orgao: string;
  versaoId: string;
  nomeOrganograma: string;
  documentoLegal: string;
  busca: string;
  codigoUnidade: string;
  nomeUnidade: string;
  tipoFiltro: string;
  nivel: string;
  situacao: string;
  competencia: string;
  versaoComparacaoId: string;
};
type AdicionarUnidadeForm = { unidadeExistenteId: string; tipo: string; codigo: string; nivel: string; nome: string; documentoLegalId: string; dataCriacao: string; outraLocalidade: "NAO" | "SIM"; cep: string; estado: string; cidade: string; bairro: string; tipoLogradouro: string; logradouro: string; numero: string; complemento: string };

const opcoes = (valores: string[]) => valores.map((valor) => ({ label: valor, value: valor }));
const semErro = () => null;
const cidadesPorEstado: Record<string, string[]> = {
  MT: ["Cuiabá", "Rondonópolis", "Sinop", "Várzea Grande", "Cáceres", "Tangará da Serra"],
  GO: ["Goiânia", "Anápolis", "Aparecida de Goiânia", "Rio Verde"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena"],
  SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"],
};

function OrganogramaDetalheContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const parametros = new URLSearchParams(location.search);
  const orgaoInicial = parametros.get("orgao") ?? "SEPLAG";
  const versaoInicial = parametros.get("versao") ?? "";
  const { control, watch, setValue } = useForm<Filtros>({
    defaultValues: {
      orgao: orgaoInicial === "SEPLAG" ? "SEPLAG - Secretaria de Estado de Planejamento e Gestão" : orgaoInicial === "SEDUC" ? "SEDUC - Secretaria de Estado de Educação" : orgaoInicial,
      versaoId: versaoInicial,
      nomeOrganograma: "Estrutura Organizacional SEPLAG - 2026",
      documentoLegal: "Decreto nº 2.185, de 03/07/2026",
      busca: "",
      codigoUnidade: "",
      nomeUnidade: "",
      tipoFiltro: "",
      nivel: "Todos os níveis",
      situacao: "",
      competencia: "",
      versaoComparacaoId: "",
    },
  });
  const [visao, setVisao] = useState<"arvore" | "lista">("arvore");
  const [modo, setModo] = useState<"consulta" | "editar">(parametros.get("editar") === "true" ? "editar" : "consulta");
  const [comparar, setComparar] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [selecionada, setSelecionada] = useState<Unidade | null>(null);
  const [estrutura, setEstrutura] = useState(lerEstruturaOrganizacional);
  const [modalAdicionar, setModalAdicionar] = useState<{ referencia: Unidade | null; acao: "ABAIXO" | "IRMA" } | null>(null);
  const [modoAdicionar, setModoAdicionar] = useState<"EXISTENTE" | "NOVA">("EXISTENTE");
  const [abaModalAdicionar, setAbaModalAdicionar] = useState<"DADOS" | "HISTORICO">("DADOS");
  const [abaModalVisualizacao, setAbaModalVisualizacao] = useState<"DADOS" | "HISTORICO">("DADOS");
  const [abaEdicao, setAbaEdicao] = useState<"GRAFICA" | "LISTA">("GRAFICA");
  const [erroAdicionar, setErroAdicionar] = useState("");
  const { control: controlAdicionar, watch: watchAdicionar, reset: resetAdicionar } = useForm<AdicionarUnidadeForm>({ defaultValues: { unidadeExistenteId: "", tipo: "", codigo: "", nivel: "", nome: "", documentoLegalId: "", dataCriacao: "", outraLocalidade: "NAO", cep: "", estado: "", cidade: "", bairro: "", tipoLogradouro: "", logradouro: "", numero: "", complemento: "" } });
  const orgaosDisponiveis = [...new Set(estrutura.versoes.map((versao) => versao.orgao))];
  const orgao = watch("orgao");
  const orgaoSelecionado = orgao.split(" - ")[0];
  const versaoVigente = obterVersaoVigente(estrutura, orgaoSelecionado);
  const versoesDoOrgao = useMemo(() => estrutura.versoes.filter((versao) => versao.orgao === orgaoSelecionado).sort((a, b) => b.inicio.localeCompare(a.inicio)), [estrutura, orgaoSelecionado]);
  const versaoIdForm = watch("versaoId");
  const versaoId = versaoIdForm || versaoVigente?.id || "";
  const versaoSelecionada = versoesDoOrgao.find((versao) => versao.id === versaoId) ?? versaoVigente;
  const versaoComparacao = versoesDoOrgao.find((versao) => versao.id === watch("versaoComparacaoId"));
  const unidades = useMemo(() => versaoSelecionada ? obterUnidadesDaVersao(estrutura, versaoSelecionada.id) : [], [estrutura, versaoSelecionada]);
  const unidadesComparacao = useMemo(() => versaoComparacao ? obterUnidadesDaVersao(estrutura, versaoComparacao.id) : [], [estrutura, versaoComparacao]);
  const busca = watch("busca");
  const codigoUnidade = watch("codigoUnidade");
  const nomeUnidade = watch("nomeUnidade");
  const tipoFiltro = watch("tipoFiltro");
  const nivel = watch("nivel");
  const situacao = watch("situacao");
  const competencia = watch("competencia");

  useEffect(() => {
    if (versaoVigente && !versoesDoOrgao.some((versao) => versao.id === versaoIdForm)) setValue("versaoId", versaoVigente.id);
    setValue("nomeOrganograma", versaoSelecionada?.nome ?? "Organograma não cadastrado");
    setValue("documentoLegal", versaoSelecionada?.documentoLegal ?? "Documento legal não informado");
  }, [setValue, versaoIdForm, versaoSelecionada, versaoVigente, versoesDoOrgao]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const codigoFiltro = codigoUnidade.trim().toLocaleLowerCase("pt-BR");
    const nomeFiltro = nomeUnidade.trim().toLocaleLowerCase("pt-BR");
    return unidades.filter((unidade) =>
      (!codigoFiltro || unidade.codigo.toLocaleLowerCase("pt-BR").includes(codigoFiltro)) &&
      (!nomeFiltro || unidade.nome.toLocaleLowerCase("pt-BR").includes(nomeFiltro)) &&
      (!tipoFiltro || unidade.tipo === tipoFiltro) &&
      (nivel === "Todos os níveis" || unidade.nivelOrganizacional === nivel) &&
      (!situacao || (situacao === "EM_EXTINCAO" ? unidade.situacao === "INATIVA" : unidade.situacao === situacao)) &&
      (!competencia || unidade.dataInicio === competencia) &&
      (!termo || `${unidade.codigo} ${unidade.nome} ${unidade.tipo} ${unidade.nivelOrganizacional}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)),
    );
  }, [busca, codigoUnidade, nomeUnidade, tipoFiltro, nivel, situacao, competencia, unidades]);

  const idsVisiveis = useMemo(() => {
    if (!busca.trim() && !codigoUnidade.trim() && !nomeUnidade.trim() && !tipoFiltro && nivel === "Todos os níveis" && !situacao && !competencia) return new Set(unidades.map((unidade) => unidade.id));
    const ids = new Set(filtradas.map((unidade) => unidade.id));
    filtradas.forEach((unidade) => {
      let superior = unidade.superiorId;
      while (superior) {
        ids.add(superior);
        superior = unidades.find((item) => item.id === superior)?.superiorId ?? null;
      }
    });
    return ids;
  }, [busca, codigoUnidade, nomeUnidade, tipoFiltro, nivel, situacao, competencia, filtradas]);

  const nomeSuperior = (unidade: Unidade) =>
    unidades.find((item) => item.id === unidade.superiorId)?.nome ?? "Órgão/Entidade";

  const filhosDe = (superiorId: number | null, itens = unidades) => itens.filter((item) => item.superiorId === superiorId).sort((a, b) => a.ordem - b.ordem);
  const indices = useMemo(() => {
    const resultado = new Map<number, string>();
    const preencher = (superiorId: number | null, prefixo: string) => filhosDe(superiorId).forEach((unidade, indice) => { const codigo = `${prefixo}.${indice + 1}`; resultado.set(unidade.id, codigo); preencher(unidade.id, codigo); });
    preencher(null, "1"); return resultado;
  }, [unidades]);
  const abrirAdicionar = (acao: "ABAIXO" | "IRMA", referencia: Unidade | null = null) => { resetAdicionar({ unidadeExistenteId: "", tipo: "", codigo: "", nivel: "", nome: "", documentoLegalId: versaoSelecionada?.documentoLegalId ?? "", dataCriacao: versaoSelecionada?.inicio ?? "", outraLocalidade: "NAO", cep: "", estado: "", cidade: "", bairro: "", tipoLogradouro: "", logradouro: "", numero: "", complemento: "" }); setModoAdicionar("NOVA"); setAbaModalAdicionar("DADOS"); setErroAdicionar(""); setModalAdicionar({ referencia, acao }); };

  const profundidade = (unidade: Unidade) => {
    let valor = 0;
    let superior = unidade.superiorId;
    while (superior) {
      valor += 1;
      superior = unidades.find((item) => item.id === superior)?.superiorId ?? null;
    }
    return valor;
  };

  const exportarPdf = () => {
    document.body.classList.add("organograma-print-mode");
    const limpar = () => document.body.classList.remove("organograma-print-mode");
    window.addEventListener("afterprint", limpar, { once: true });
    window.print();
    window.setTimeout(limpar, 1000);
  };

  const NoArvore = ({ unidade, raiz = false }: { unidade: Unidade; raiz?: boolean }) => {
    const filhos = filhosDe(unidade.id).filter((item) => idsVisiveis.has(item.id));
    const especial = unidade.nivelOrganizacional === "Nível de Decisão Colegiada" ? "is-special-decision" : unidade.nivelOrganizacional === "Nível de Administração Descentralizada" ? "is-special-decentralized" : "";
    return (
      <div className="organograma-tree-wrap">
        <div className={`organograma-tree-node ${raiz ? "is-root" : ""} ${especial}`}>
          <button type="button" className="organograma-tree-node-detail" onClick={() => setSelecionada(unidade)}><span>{indices.get(unidade.id)} · {unidade.codigo}</span><strong>{unidade.nome}</strong><small>{unidade.tipo} · {unidade.nivelOrganizacional.replace("Nível de ", "")}</small></button>
          {modo === "editar" && <span className="organograma-node-actions"><button type="button" className="organograma-add-child" title="Adicionar unidade abaixo" onClick={() => abrirAdicionar("ABAIXO", unidade)}><i className="pi pi-arrow-down" /></button><button type="button" className="organograma-add-sibling" title="Adicionar unidade no mesmo nível" onClick={() => abrirAdicionar("IRMA", unidade)}><i className="pi pi-arrows-h" /></button></span>}
        </div>
        {filhos.length > 0 && (
          <>
            <div className="organograma-tree-line" />
            <div className="organograma-tree-children">
              {filhos.map((filho) => (
                <div className="organograma-tree-branch" key={filho.id}>
                  <NoArvore unidade={filho} />
                </div>
              ))}
            </div>
          </>
        )}
        {modo === "editar" && filhos.length === 0 && <button type="button" className="organograma-empty-add" onClick={() => abrirAdicionar("ABAIXO", unidade)}><i className="pi pi-plus" /> Adicionar unidade abaixo</button>}
      </div>
    );
  };

  const raizes = filhosDe(null).filter((item) => idsVisiveis.has(item.id));
  const comparacoesReais = useMemo(() => {
    if (!versaoComparacao) return [];
    const anteriores = new Map(unidadesComparacao.map((unidade) => [unidade.id, unidade])); const atuais = new Map(unidades.map((unidade) => [unidade.id, unidade]));
    return [...new Set([...anteriores.keys(), ...atuais.keys()])].map((id) => { const anterior = anteriores.get(id); const atual = atuais.get(id); const status = !anterior ? "incluida" : !atual ? "removida" : anterior.superiorId !== atual.superiorId || anterior.ordem !== atual.ordem || anterior.nivelOrganizacional !== atual.nivelOrganizacional ? "alterada" : null; return status ? { status, unidade: atual ?? anterior!, anterior: anterior ? unidadesComparacao.find((item) => item.id === anterior.superiorId)?.nome ?? "Órgão/Entidade" : "Não existia", atual: atual ? nomeSuperior(atual) : "Unidade extinta/removida" } : null; }).filter((item): item is { status: "incluida" | "removida" | "alterada"; unidade: Unidade; anterior: string; atual: string } => item !== null);
  }, [unidades, unidadesComparacao, versaoComparacao]);

  const contextoAdicionar = modalAdicionar ? (() => {
    const referencia = modalAdicionar.referencia;
    const superiorId = modalAdicionar.acao === "ABAIXO" ? referencia?.id ?? null : referencia?.superiorId ?? null;
    const superiorNome = superiorId ? unidades.find((unidade) => unidade.id === superiorId)?.nome ?? "Unidade superior" : orgao;
    const ordem = modalAdicionar.acao === "IRMA" && referencia ? referencia.ordem + 1 : filhosDe(superiorId).length + 1;
    return { superiorId, superiorNome, ordem, descricao: modalAdicionar.acao === "ABAIXO" ? `Abaixo de ${referencia?.nome ?? orgao}` : `No mesmo nível de ${referencia?.nome}` };
  })() : null;
  const unidadesDisponiveis = estrutura.unidades.filter((unidade) => unidade.orgao === orgaoSelecionado && unidade.situacao === "ATIVA" && !unidades.some((posicionada) => posicionada.id === unidade.id));
  const salvarAdicao = () => {
    if (!modalAdicionar || !contextoAdicionar || !versaoSelecionada) return;
    if (modoAdicionar === "EXISTENTE") {
      const unidadeId = Number(watchAdicionar("unidadeExistenteId"));
      if (!unidadeId) { setErroAdicionar("Selecione uma Unidade existente."); return; }
      setEstrutura(vincularUnidadeAoOrganograma(versaoSelecionada.id, unidadeId, contextoAdicionar.superiorId, contextoAdicionar.ordem));
    } else {
      if (!watchAdicionar("tipo") || !watchAdicionar("nome").trim() || !watchAdicionar("nivel") || !watchAdicionar("documentoLegalId") || !watchAdicionar("dataCriacao")) { setErroAdicionar("Informe tipo, nível organizacional, nome, data de criação e documento legal."); return; }
      if (watchAdicionar("outraLocalidade") === "SIM" && (!watchAdicionar("estado") || !watchAdicionar("cidade"))) { setErroAdicionar("Informe o estado e a cidade da localização própria da unidade."); return; }
      const possuiEnderecoProprio = watchAdicionar("outraLocalidade") === "SIM";
      setEstrutura(cadastrarUnidadeNoOrganograma(versaoSelecionada.id, { codigo: "", nome: watchAdicionar("nome").trim(), sigla: "", orgao: orgaoSelecionado, tipo: watchAdicionar("tipo"), nivelOrganizacional: watchAdicionar("nivel"), localizacao: possuiEnderecoProprio ? `${watchAdicionar("cidade")}/ ${watchAdicionar("estado")}` : "Cuiabá/MT", situacao: "ATIVA", dataInicio: watchAdicionar("dataCriacao"), documentoCriacaoId: watchAdicionar("documentoLegalId"), documentosLegaisCriacaoIds: [watchAdicionar("documentoLegalId")], outraLocalidade: possuiEnderecoProprio, endereco: possuiEnderecoProprio ? { cep: watchAdicionar("cep"), estado: watchAdicionar("estado"), municipio: watchAdicionar("cidade"), bairro: watchAdicionar("bairro"), tipoLogradouro: watchAdicionar("tipoLogradouro"), logradouro: watchAdicionar("logradouro"), numero: watchAdicionar("numero"), complemento: watchAdicionar("complemento") } : undefined }, contextoAdicionar.superiorId, contextoAdicionar.ordem));
    }
    setModalAdicionar(null); setErroAdicionar("");
  };
  const abrirVisualizacao = (unidade: Unidade) => { setSelecionada(unidade); setAbaModalVisualizacao("DADOS"); };

  const NoMontagem = ({ unidade }: { unidade: Unidade }) => {
    const filhos = filhosDe(unidade.id);
    return (
      <div className="organograma-builder-branch">
        <div className="organograma-builder-node-wrap">
          <article className="organograma-builder-node">
            <button type="button" className="organograma-builder-node-content" onClick={() => abrirVisualizacao(unidade)} title="Visualizar cadastro da unidade">
              <small>{indices.get(unidade.id)} · {unidade.codigo}</small>
              <strong>{unidade.nome}</strong>
              <span>Nível da unidade: {unidade.nivelOrganizacional.replace("Nível de ", "")}</span>
            </button>
            <button type="button" className="organograma-builder-add is-right" aria-label="Adicionar unidade no mesmo nível" title="Adicionar unidade no mesmo nível" onClick={() => abrirAdicionar("IRMA", unidade)}><i className="pi pi-plus-circle" /></button>
            <button type="button" className="organograma-builder-add is-bottom" aria-label="Adicionar unidade abaixo" title="Adicionar unidade abaixo" onClick={() => abrirAdicionar("ABAIXO", unidade)}><i className="pi pi-plus-circle" /></button>
          </article>
        </div>
        {filhos.length > 0 && <div className="organograma-builder-children">{filhos.map((filho) => <NoMontagem key={filho.id} unidade={filho} />)}</div>}
      </div>
    );
  };

  return (
    <div className="organograma-page organograma-builder-reset">
      <CardSeplag
        title="Organograma"
        cols="12"
        cardHeaderClassNames="prototype-carreira-card organograma-card"
        headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Organogramas" }, { label: "Organograma" }]} />}
      >
        <section className="organograma-global-filters" aria-label="Filtros da estrutura organizacional">
          <div className="grid">
            <TextFieldSeplag name="codigoUnidade" control={control} label="Código" placeholder="Digite o código" cols="12 6 2" getFormErrorMessage={semErro} />
            <TextFieldSeplag name="nomeUnidade" control={control} label="Nome da unidade" placeholder="Digite o nome" cols="12 6 3" getFormErrorMessage={semErro} />
            <DropdownFieldSeplag name="tipoFiltro" control={control} label="Tipo" placeholder="Todos" cols="12 6 2" options={opcoes([...new Set(unidades.map((unidade) => unidade.tipo))])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={semErro} />
            <DropdownFieldSeplag name="nivel" control={control} label="Nível organizacional" placeholder="Todos" cols="12 6 2" options={opcoes(["Todos os níveis", ...new Set(unidades.map((unidade) => unidade.nivelOrganizacional))])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Ativa", value: "ATIVA" }, { label: "Em Extinção", value: "EM_EXTINCAO" }, { label: "Extinta", value: "EXTINTA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={semErro} />
            <DateFieldSeplag name="competencia" control={control} label="Competência" cols="12 6 2" getFormErrorMessage={semErro} />
            <div className="col-12 organograma-global-filter-clear"><BotaoLimparFiltroSeplag label="Limpar filtros" icon="pi pi-refresh" onClick={() => { setValue("codigoUnidade", ""); setValue("nomeUnidade", ""); setValue("tipoFiltro", ""); setValue("nivel", "Todos os níveis"); setValue("situacao", ""); setValue("competencia", ""); setValue("busca", ""); }} /></div>
          </div>
        </section>
        <PanelSeplag title={orgao} description="Área de montagem da estrutura organizacional." className="organograma-panel">
          <div className="organograma-editor-tabs" role="tablist" aria-label="Visualizações do organograma">
            <button type="button" role="tab" aria-selected={abaEdicao === "GRAFICA"} className={abaEdicao === "GRAFICA" ? "is-active" : ""} onClick={() => setAbaEdicao("GRAFICA")}><i className="pi pi-sitemap" /> Visão gráfica (Árvore)</button>
            <button type="button" role="tab" aria-selected={abaEdicao === "LISTA"} className={abaEdicao === "LISTA" ? "is-active" : ""} onClick={() => setAbaEdicao("LISTA")}><i className="pi pi-list" /> Lista de Unidades <span>{unidades.length}</span></button>
          </div>
          {abaEdicao === "GRAFICA" ? <div className="organograma-clean-canvas organograma-root-stage" aria-label="Área de montagem do organograma">
            <div className="organograma-root-level">Nível 1 — Órgão</div>
            <div className="organograma-root-wrap">
              <span className="organograma-root-index">1</span>
              <article className="organograma-root-card">
                <small>Cód. {versaoSelecionada?.codigoOrgao ?? orgaoSelecionado}</small>
                <strong>{orgao}</strong>
                <span>Nível da unidade: Órgão/Entidade</span>
              </article>
              <button type="button" className="organograma-root-add is-left" aria-label="Cadastrar unidade" title="Cadastrar unidade" onClick={() => { abrirAdicionar("ABAIXO"); setModoAdicionar("NOVA"); }}><i className="pi pi-plus-circle" /></button>
              <button type="button" className="organograma-root-add is-right" aria-label="Cadastrar unidade" title="Cadastrar unidade" onClick={() => { abrirAdicionar("ABAIXO"); setModoAdicionar("NOVA"); }}><i className="pi pi-plus-circle" /></button>
              <button type="button" className="organograma-root-add is-bottom" aria-label="Cadastrar unidade abaixo" title="Cadastrar unidade abaixo" onClick={() => { abrirAdicionar("ABAIXO"); setModoAdicionar("NOVA"); }}><i className="pi pi-plus-circle" /></button>
            </div>
            {raizes.length > 0 && <div className="organograma-builder-children organograma-builder-root-children">{raizes.map((unidade) => <NoMontagem key={unidade.id} unidade={unidade} />)}</div>}
          </div> : <section className="organograma-units-list">
            <div className="organograma-units-table-wrap"><table className="organograma-units-table"><thead><tr><th>Código</th><th>Unidade</th><th>Órgão/Entidade</th><th>Tipo</th><th>Nível Organizacional</th><th>Situação</th><th>Ações</th></tr></thead><tbody>{filtradas.map((unidade) => <tr key={unidade.id}><td>{indices.get(unidade.id)}</td><td><strong>{unidade.nome}</strong><small>{unidade.sigla ? `${unidade.sigla} · ` : ""}{unidade.codigo}</small></td><td>{orgaoSelecionado}</td><td><span className="organograma-list-type">{unidade.tipo}</span></td><td>{unidade.nivelOrganizacional}</td><td><BadgeSeplag label={unidade.situacao === "ATIVA" ? "Ativa" : unidade.situacao === "INATIVA" ? "Inativa" : "Extinta"} color={unidade.situacao === "ATIVA" ? "#00843d" : "#64748b"} bg={unidade.situacao === "ATIVA" ? "#e2f3e8" : "#f1f5f9"} border="transparent" size="sm" /></td><td><button type="button" className="organograma-units-view" title="Visualizar unidade" onClick={() => abrirVisualizacao(unidade)}><i className="pi pi-eye" /></button></td></tr>)}{filtradas.length === 0 && <tr><td colSpan={7} className="organograma-units-empty">Nenhuma unidade encontrada.</td></tr>}</tbody></table></div>
            <p className="organograma-units-summary">Exibindo {filtradas.length} {filtradas.length === 1 ? "unidade" : "unidades"} da estrutura.</p>
          </section>}
        </PanelSeplag>
      </CardSeplag>
      <ModalSeplag visible={Boolean(modalAdicionar)} titulo="Incluir unidade na estrutura" fechar={() => setModalAdicionar(null)} labelFechar="Cancelar" labelAcao="Cadastrar unidade" funcAcao={salvarAdicao} tamanho="min(1420px, calc(100vw - 32px))">
        {modalAdicionar && contextoAdicionar && <div className="grid organograma-add-modal">
          <div className="col-12 organograma-add-context"><span>Órgão/Entidade</span><strong>{orgao}</strong><small>Unidade superior: {contextoAdicionar.superiorNome}</small></div>
          <div className="col-12 organograma-add-tabs" role="tablist" aria-label="Seções da unidade">
            <button type="button" role="tab" aria-selected={abaModalAdicionar === "DADOS"} className={abaModalAdicionar === "DADOS" ? "is-active" : ""} onClick={() => setAbaModalAdicionar("DADOS")}><i className="pi pi-id-card" /> Dados da Unidade</button>
            <button type="button" role="tab" aria-selected={abaModalAdicionar === "HISTORICO"} className={abaModalAdicionar === "HISTORICO" ? "is-active" : ""} onClick={() => setAbaModalAdicionar("HISTORICO")}><i className="pi pi-history" /> Histórico de Alterações <span>0</span></button>
          </div>
          {abaModalAdicionar === "DADOS" && <>
          {erroAdicionar && <p className="col-12 organograma-new-error">{erroAdicionar}</p>}
          <DropdownFieldSeplag name="nivel" control={controlAdicionar} label="Nível organizacional" placeholder="Selecione..." cols="12 6" required options={opcoes(["Nível de Decisão Colegiada", "Nível de Direção Superior", "Nível de Assessoramento Superior", "Nível Assessoramento Estratégico e Especializado", "Nível de Administração Sistêmica", "Nível de Execução Programática", "Nível de Administração Regionalizada", "Nível de Administração Desconcentrada", "Nível de Administração Descentralizada"])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
          <DateFieldSeplag name="dataCriacao" control={controlAdicionar} label="Data de criação" cols="12 6" required getFormErrorMessage={semErro} />
          <DropdownFieldSeplag name="tipo" control={controlAdicionar} label="Tipo de unidade" placeholder="Selecione..." cols="12 4" required options={opcoes(tiposUnidadesAtivos())} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
          <TextFieldSeplag name="codigo" control={controlAdicionar} label="Código" placeholder="Gerado automaticamente" cols="12 2" disabled getFormErrorMessage={semErro} />
          <TextFieldSeplag name="nome" control={controlAdicionar} label="Nome da unidade" placeholder="Ex.: Gabinete do Secretário" cols="12 6" required getFormErrorMessage={semErro} />
          <DropdownFieldSeplag name="documentoLegalId" control={controlAdicionar} label="Documento legal de criação" placeholder="Selecione..." cols="12" required options={estrutura.documentosLegais.filter((documento) => documento.ativo).map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
          <section className="col-12 organograma-modal-location"><h4>Localização</h4><p>UF e Município são herdados do órgão. Informe endereço próprio somente quando a unidade funcionar em outra localidade.</p><RadioButtonFieldSeplag name="outraLocalidade" control={controlAdicionar} label="A unidade funciona em outra localidade?" cols="12" options={[{ label: "Não", value: "NAO" }, { label: "Sim", value: "SIM" }]} getFormErrorMessage={semErro} />
            {watchAdicionar("outraLocalidade") === "NAO" ? <div className="organograma-location-inherited"><div><span>UF</span><strong>MT</strong><small>Herdado do órgão</small></div><div><span>Município</span><strong>Cuiabá</strong><small>Herdado do órgão</small></div></div> : <div className="grid organograma-location-fields"><DropdownFieldSeplag name="estado" control={controlAdicionar} label="Estado" placeholder="Selecione..." cols="12 4" required options={opcoes(["MT", "GO", "MS", "RO", "SP"])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><DropdownFieldSeplag name="cidade" control={controlAdicionar} label="Cidade" placeholder={watchAdicionar("estado") ? "Selecione..." : "Selecione o estado primeiro"} cols="12 4" required disabled={!watchAdicionar("estado")} options={opcoes(cidadesPorEstado[watchAdicionar("estado")] ?? [])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><TextFieldSeplag name="complemento" control={controlAdicionar} label="Complemento" placeholder="Informe o complemento" cols="12 4" getFormErrorMessage={semErro} /></div>}
          </section>
          </>}
          {abaModalAdicionar === "HISTORICO" && <section className="col-12 organograma-add-history"><header><div><strong>Histórico de Alterações</strong><span>Registro cronológico de alterações e documentos vinculados a esta unidade.</span></div><small>0 registros encontrados</small></header><div className="organograma-add-history-empty"><i className="pi pi-history" /><strong>Nenhum histórico disponível</strong><span>O registro de criação será gerado automaticamente quando a unidade for cadastrada.</span></div></section>}
        </div>}
      </ModalSeplag>
      <ModalSeplag visible={Boolean(selecionada)} titulo="Cadastro da unidade" fechar={() => setSelecionada(null)} tamanho="min(1120px, calc(100vw - 32px))" customFooter={<BotaoSeplag label="Fechar" icon="pi pi-times" outlined onClick={() => setSelecionada(null)} />}>
        {selecionada && <div className="grid organograma-read-modal">
          <div className="col-12 organograma-add-context"><span>Órgão/Entidade</span><strong>{orgao}</strong><small>Unidade superior: {nomeSuperior(selecionada)}</small></div>
          <div className="col-12 organograma-add-tabs" role="tablist" aria-label="Seções do cadastro da unidade">
            <button type="button" role="tab" aria-selected={abaModalVisualizacao === "DADOS"} className={abaModalVisualizacao === "DADOS" ? "is-active" : ""} onClick={() => setAbaModalVisualizacao("DADOS")}><i className="pi pi-id-card" /> Dados da Unidade</button>
            <button type="button" role="tab" aria-selected={abaModalVisualizacao === "HISTORICO"} className={abaModalVisualizacao === "HISTORICO" ? "is-active" : ""} onClick={() => setAbaModalVisualizacao("HISTORICO")}><i className="pi pi-history" /> Histórico de Alterações <span>2</span></button>
          </div>
          {abaModalVisualizacao === "DADOS" ? <section className="col-12 organograma-read-data"><div><span>Código</span><strong>{selecionada.codigo}</strong></div><div><span>Tipo de unidade</span><strong>{selecionada.tipo}</strong></div><div><span>Nível organizacional</span><strong>{selecionada.nivelOrganizacional}</strong></div><div className="is-wide"><span>Nome da unidade</span><strong>{selecionada.nome}</strong></div><div><span>Data de criação</span><strong>{selecionada.dataInicio}</strong></div><div><span>Documento legal de criação</span><strong>{versaoSelecionada?.documentoLegal ?? "Não informado"}</strong></div><div><span>Localização</span><strong>{selecionada.localizacao}</strong></div></section> : <section className="col-12 organograma-add-history"><header><div><strong>Histórico de Alterações</strong><span>Registro cronológico de alterações e documentos vinculados a esta unidade.</span></div><small>2 registros encontrados</small></header><article className="organograma-history-record"><div className="organograma-history-record-title"><span>v2.0</span><strong>Alteração da classificação organizacional</strong><small>25/09/2026 às 10:14 por Administrador SIGEP</small></div><table><thead><tr><th>Campo alterado</th><th>Valor anterior</th><th>Valor novo</th></tr></thead><tbody><tr><td>Nível organizacional</td><td>Nível de Direção Superior</td><td>{selecionada.nivelOrganizacional}</td></tr><tr><td>Documento legal de criação</td><td>Decreto nº 1.050/2024</td><td>{versaoSelecionada?.documentoLegal ?? "Não informado"}</td></tr></tbody></table></article><article className="organograma-history-record"><div className="organograma-history-record-title"><span className="is-created">v1.0</span><strong>Criação da Unidade no Organograma</strong><small>{selecionada.dataInicio} por Sistema</small></div></article></section>}
        </div>}
      </ModalSeplag>
    </div>
  );

  return (
    <div className="organograma-page">
      <CardSeplag
        title="Organograma"
        cols="12"
        cardHeaderClassNames="prototype-carreira-card organograma-card"
        headerNavigation={
          <BreadcrumbSeplag
            divided
            items={[
              { label: "Cadastro" },
              { label: "Estrutura Organizacional" },
              { label: "Organograma" },
            ]}
          />
        }
      >
        <p className="organograma-intro">
          Consulte a estrutura organizacional vigente e o histórico de alterações.
        </p>

        <PanelSeplag
          title="Identificação da estrutura organizacional"
          description="Selecione o órgão/entidade para consultar o organograma."
          className="organograma-panel"
        >
          <div className="grid">
            <DropdownFieldSeplag
              name="orgao"
              control={control}
              label="Órgão/Entidade"
              cols="12 12 6"
              required
              options={opcoes(orgaosDisponiveis.map((sigla) => sigla === "SEPLAG" ? "SEPLAG - Secretaria de Estado de Planejamento e Gestão" : sigla === "SEDUC" ? "SEDUC - Secretaria de Estado de Educação" : sigla))}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={semErro}
            />
            <DropdownFieldSeplag name="versaoId" control={control} label="Versão da estrutura" cols="12 12 6" options={versoesDoOrgao.map((versao) => ({ label: `${versao.situacao === "VIGENTE" ? "Vigente" : versao.situacao === "RASCUNHO" ? "Rascunho" : "Histórica"} · ${versao.inicio} · ${versao.nome}`, value: versao.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
            <TextFieldSeplag name="nomeOrganograma" control={control} label="Nome do organograma" cols="12 12 6" disabled getFormErrorMessage={semErro} />
            <TextFieldSeplag name="documentoLegal" control={control} label="Documento legal" cols="12 12 6" disabled getFormErrorMessage={semErro} />
          </div>
        </PanelSeplag>

        <PanelSeplag className="organograma-panel organograma-consulta">
          <div className="organograma-toolbar">
            <div className="organograma-view-switch" aria-label="Modo de visualização">
              <BotaoSeplag label="Organograma" icon="pi pi-sitemap" outlined={visao !== "arvore"} onClick={() => setVisao("arvore")} />
              <BotaoSeplag label="Árvore / Lista" icon="pi pi-list" outlined={visao !== "lista"} onClick={() => setVisao("lista")} />
              <BotaoSeplag label={modo === "editar" ? "Concluir edição" : "Editar estrutura"} icon={modo === "editar" ? "pi pi-check" : "pi pi-pencil"} outlined={modo !== "editar"} disabled={versaoSelecionada?.situacao === "ENCERRADA"} onClick={() => setModo((valor) => valor === "editar" ? "consulta" : "editar")} />
              {versaoSelecionada?.situacao === "RASCUNHO" && <BotaoSeplag label="Publicar organograma" icon="pi pi-check-circle" onClick={() => { const atualizada = publicarOrganograma(versaoSelecionada.id); setEstrutura(atualizada); setModo("consulta"); }} />}
              <BotaoSeplag label={expandido ? "Fechar tela cheia" : "Expandir"} icon={expandido ? "pi pi-times" : "pi pi-window-maximize"} outlined onClick={() => setExpandido((valor) => !valor)} />
              <BotaoSeplag label="Exportar PDF" icon="pi pi-file-pdf" outlined onClick={exportarPdf} />
            </div>
          </div>
          <div className="grid organograma-filters">
            <TextFieldSeplag name="busca" control={control} label="Pesquisar unidade" placeholder="Buscar por código, nome, tipo ou nível" cols="12 6 5" getFormErrorMessage={semErro} />
            <DropdownFieldSeplag name="nivel" control={control} label="Filtrar por nível" cols="12 6 3" options={opcoes(["Todos os níveis", ...new Set(unidades.map((unidade) => unidade.nivelOrganizacional))])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
            {visao === "lista" && (
              <div className="col-12 md:col-4 organograma-compare-wrap">
                <label className="organograma-compare-toggle">
                  <input type="checkbox" checked={comparar} onChange={(event) => setComparar(event.target.checked)} />
                  <span>Comparar períodos</span>
                </label>
              </div>
            )}
          </div>
        </PanelSeplag>
        {modo === "editar" && <section className="organograma-edit-notice"><i className="pi pi-info-circle" aria-hidden="true" /><span><strong>Modo de edição estrutural.</strong> Em cada nó, use ↓ para adicionar abaixo ou ↔ para criar no mesmo nível. Você poderá vincular uma Unidade existente ou cadastrar uma nova sem sair do organograma.</span></section>}

        {visao === "lista" && comparar && (
          <section className="organograma-comparison-settings">
            <div className="organograma-comparison-copy">
              <i className="pi pi-arrow-right-arrow-left" aria-hidden="true" />
              <div>
                <strong>Modo comparativo de estrutura</strong>
                <span>Compare dois períodos para identificar alterações de composição e subordinação.</span>
              </div>
            </div>
            <div className="grid organograma-comparison-dates">
              <DropdownFieldSeplag name="versaoComparacaoId" control={control} label="Versão de comparação (base)" cols="12" placeholder="Selecione a versão" options={versoesDoOrgao.filter((versao) => versao.id !== versaoSelecionada?.id).map((versao) => ({ label: `${versao.inicio}${versao.fim ? ` a ${versao.fim}` : ""} · ${versao.nome}`, value: versao.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
            </div>
            <div className="organograma-legend">
              <span><i className="is-added" />Unidade criada/inserida</span>
              <span><i className="is-removed" />Unidade extinta/removida</span>
              <span><i className="is-changed" />Subordinação ou tipo alterado</span>
            </div>
          </section>
        )}

        <PanelSeplag
          title={visao === "arvore" ? "Estrutura hierárquica" : comparar ? "Comparação da estrutura" : "Estrutura da SEPLAG"}
          description={visao === "arvore" ? "Selecione uma unidade no organograma para consultar os detalhes." : comparar ? "Consulte as alterações entre os períodos selecionados." : "Cadastro baseado na estrutura definida no Decreto nº 2.185/2026."}
          className={`organograma-panel organograma-result ${expandido ? "is-expanded" : ""}`}
        >
          {expandido && (
            <div className="organograma-expanded-toolbar">
              <strong>Estrutura da SEPLAG</strong>
              <div className="organograma-expanded-actions">
                <BotaoSeplag label="Exportar PDF" icon="pi pi-file-pdf" outlined onClick={exportarPdf} />
                <BotaoSeplag label="Fechar tela cheia" icon="pi pi-times" outlined onClick={() => setExpandido(false)} />
              </div>
            </div>
          )}
          {visao === "arvore" ? (
            <div className="organograma-tree-canvas">
              <div className="organograma-tree"><div className="organograma-tree-wrap">
                <div className="organograma-tree-node is-root"><button type="button" className="organograma-tree-node-detail" onClick={() => setSelecionada(null)}><span>1 · ÓRGÃO/ENTIDADE</span><strong>{orgao}</strong><small>Raiz da estrutura organizacional</small></button>{modo === "editar" && <button type="button" className="organograma-add-child" title="Adicionar unidade abaixo do órgão" onClick={() => abrirAdicionar("ABAIXO")}><i className="pi pi-arrow-down" /></button>}</div>
                {raizes.length > 0 && <><div className="organograma-tree-line" /><div className="organograma-tree-children">{raizes.map((unidade) => <div className="organograma-tree-branch" key={unidade.id}><NoArvore unidade={unidade} /></div>)}</div></>}
                {raizes.length === 0 && <p>Nenhuma unidade encontrada.</p>}
              </div></div>
            </div>
          ) : comparar ? (
            <div className="organograma-table-scroll">
              <table className="organograma-table organograma-comparison-table">
                <thead><tr><th>Status da alteração</th><th>Código e nome da unidade</th><th>Superior na versão base</th><th>Superior na versão exibida</th><th>Documento/observação</th></tr></thead>
                <tbody>
                  {comparacoesReais.map((item) => (
                    <tr className={`is-${item.status}`} key={item.unidade.id}>
                      <td><span className={`organograma-status is-${item.status}`}>{item.status === "incluida" ? "Incluída" : item.status === "removida" ? "Removida" : "Alterada"}</span></td>
                      <td><strong>{item.unidade.codigo}</strong><span>{item.unidade.nome}</span></td>
                      <td>{item.anterior}</td><td>{item.atual}</td><td>{versaoSelecionada?.documentoLegal ?? "Não informado"}</td>
                    </tr>
                  ))}
                  {versaoComparacao && comparacoesReais.length === 0 && <tr><td colSpan={5}>Não há alterações entre as versões selecionadas.</td></tr>}
                  {!versaoComparacao && <tr><td colSpan={5}>Selecione uma versão base para comparar.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="organograma-hierarchy-list">
              {filtradas.map((unidade) => (
                <button type="button" key={unidade.id} className="organograma-hierarchy-row" style={{ paddingLeft: `${12 + profundidade(unidade) * 22}px` }} onClick={() => setSelecionada(unidade)}>
                  <strong>{indices.get(unidade.id)} · {unidade.codigo} - {unidade.nome}</strong>
                  <span>{unidade.nivelOrganizacional} <i>•</i> Superior: {nomeSuperior(unidade)}</span>
                </button>
              ))}
              {filtradas.length === 0 && <p className="organograma-empty">Nenhuma unidade encontrada.</p>}
            </div>
          )}
          <div className="organograma-result-summary">
            {visao === "lista" && !comparar && `${filtradas.length} ${filtradas.length === 1 ? "unidade encontrada" : "unidades encontradas"}`}
            {visao === "lista" && comparar && versaoComparacao && `${comparacoesReais.length} alterações identificadas`}
          </div>
        </PanelSeplag>
      </CardSeplag>

      <ModalSeplag
        visible={Boolean(selecionada)}
        titulo="Detalhes da unidade"
        fechar={() => setSelecionada(null)}
        labelFechar="Fechar"
        tamanho="760px"
        customFooter={<BotaoSeplag label="Fechar" icon="pi pi-times" outlined onClick={() => setSelecionada(null)} />}
      >
        {selecionada && (
          <div className="col-12 organograma-detail">
            <header><span>{indices.get(selecionada.id)} · {selecionada.codigo}</span><h3>{selecionada.nome}</h3></header>
            <dl>
              <div><dt>Tipo de unidade</dt><dd>{selecionada.tipo}</dd></div>
              <div><dt>Nível organizacional</dt><dd>{selecionada.nivelOrganizacional}</dd></div>
              <div><dt>Unidade superior</dt><dd>{nomeSuperior(selecionada)}</dd></div>
              <div><dt>Ato legal</dt><dd>{versaoSelecionada?.documentoLegal ?? "Não informado"}</dd></div>
            </dl>
            <div className="organograma-validity">
              <article><strong>Vigência da unidade</strong><span>{selecionada.dataInicio} a {selecionada.dataFim ?? "Atual"}</span></article>
              <article><strong>Vigência da posição hierárquica</strong><span>{versaoSelecionada?.inicio ?? "Não informada"} a {versaoSelecionada?.fim ?? "Atual"}</span></article>
            </div>
          </div>
        )}
      </ModalSeplag>
      <ModalSeplag visible={Boolean(modalAdicionar)} titulo="Adicionar unidade à estrutura" fechar={() => setModalAdicionar(null)} labelFechar="Cancelar" labelAcao={modoAdicionar === "EXISTENTE" ? "Vincular unidade" : "Cadastrar e adicionar"} funcAcao={salvarAdicao} tamanho="760px">
        {modalAdicionar && contextoAdicionar && <div className="grid organograma-add-modal">
          <div className="col-12 organograma-add-context"><span>Órgão/Entidade</span><strong>{orgao}</strong><span>Posição</span><strong>{contextoAdicionar.descricao}</strong><small>Unidade superior: {contextoAdicionar.superiorNome} · posição {contextoAdicionar.ordem} entre as unidades do nível.</small></div>
          <div className="col-12 organograma-add-choice"><BotaoSeplag label="Selecionar unidade existente" icon="pi pi-link" outlined={modoAdicionar !== "EXISTENTE"} onClick={() => { setModoAdicionar("EXISTENTE"); setErroAdicionar(""); }} /><BotaoSeplag label="Cadastrar nova unidade" icon="pi pi-plus" outlined={modoAdicionar !== "NOVA"} onClick={() => { setModoAdicionar("NOVA"); setErroAdicionar(""); }} /></div>
          {erroAdicionar && <p className="col-12 organograma-new-error">{erroAdicionar}</p>}
          {modoAdicionar === "EXISTENTE" ? <><DropdownFieldSeplag name="unidadeExistenteId" control={controlAdicionar} label="Unidade existente" placeholder="Pesquise e selecione a unidade..." cols="12" options={unidadesDisponiveis.map((unidade) => ({ label: `${unidade.codigo} · ${unidade.nome} (${unidade.tipo})`, value: String(unidade.id) }))} optionLabel="label" optionValue="value" filter showClear getFormErrorMessage={semErro} /><small className="col-12 organograma-add-help">São exibidas somente unidades ativas deste órgão que ainda não fazem parte desta versão.</small>{unidadesDisponiveis.length === 0 && <p className="col-12 organograma-add-help">Não há unidades disponíveis para vinculação. Cadastre uma nova unidade.</p>}</> : <><DropdownFieldSeplag name="tipo" control={controlAdicionar} label="Tipo de unidade" placeholder="Selecione..." cols="12 6" required options={opcoes(tiposUnidadesAtivos())} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><DropdownFieldSeplag name="nivel" control={controlAdicionar} label="Nível organizacional" placeholder="Selecione..." cols="12 6" required options={opcoes(["Nível de Decisão Colegiada", "Nível de Direção Superior", "Nível de Assessoramento Superior", "Nível Assessoramento Estratégico e Especializado", "Nível de Administração Sistêmica", "Nível de Execução Programática", "Nível de Administração Regionalizada", "Nível de Administração Desconcentrada", "Nível de Administração Descentralizada"])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><TextFieldSeplag name="nome" control={controlAdicionar} label="Nome da unidade" placeholder="Ex.: Ouvidoria Setorial" cols="12 8" required getFormErrorMessage={semErro} /><TextFieldSeplag name="sigla" control={controlAdicionar} label="Sigla" placeholder="Ex.: OUV" cols="12 4" getFormErrorMessage={semErro} /><DropdownFieldSeplag name="documentoLegalId" control={controlAdicionar} label="Documento legal de criação" placeholder="Selecione..." cols="12" required options={estrutura.documentosLegais.filter((documento) => documento.ativo).map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><small className="col-12 organograma-add-help">Código será gerado automaticamente. A data de início será a vigência da versão; localização é herdada do órgão.</small></>}
        </div>}
      </ModalSeplag>
    </div>
  );
}

type FiltrosListagem = { codigo: string; nome: string; situacao: string };
type NovoOrganogramaForm = { orgao: string; inicio: string; documentoLegalId: string; nome: string };
const nomeOrgao = (sigla: string) => sigla === "SEPLAG" ? "Secretaria de Estado de Planejamento e Gestão" : sigla === "SEDUC" ? "Secretaria de Estado de Educação" : sigla;

function OrganogramasListagem() {
  const navigate = useNavigate();
  const [estrutura, setEstrutura] = useState(lerEstruturaOrganizacional);
  const [pagina, setPagina] = useState(0);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const registrosPorPagina = 10;
  const { control, watch, reset } = useForm<FiltrosListagem>({ defaultValues: { codigo: "", nome: "", situacao: "" } });
  const { control: controlNovo, watch: watchNovo, reset: resetNovo } = useForm<NovoOrganogramaForm>({ defaultValues: { orgao: "", inicio: "", documentoLegalId: "", nome: "" } });
  const orgaosParaCadastro = useMemo(() => {
    const base = [
      { sigla: "SEPLAG", codigo: "001", nome: "Secretaria de Estado de Planejamento e Gestão" },
      { sigla: "SEDUC", codigo: "002", nome: "Secretaria de Estado de Educação" },
      { sigla: "CGE", codigo: "003", nome: "Controladoria Geral do Estado" },
      { sigla: "DETRAN-MT", codigo: "004", nome: "Departamento Estadual de Trânsito" },
      { sigla: "MTI", codigo: "005", nome: "Empresa Mato-grossense de Tecnologia da Informação" },
    ];
    estrutura.versoes.forEach((versao) => {
      const existente = base.find((orgao) => orgao.sigla === versao.orgao);
      if (existente) { existente.codigo = versao.codigoOrgao ?? existente.codigo; existente.nome = nomeOrgao(versao.orgao); }
      else base.push({ sigla: versao.orgao, codigo: versao.codigoOrgao ?? versao.orgao, nome: nomeOrgao(versao.orgao) });
    });
    return base.map((orgao) => ({ ...orgao, label: `${orgao.codigo} — ${orgao.nome} (${orgao.sigla})`, value: orgao.sigla }));
  }, [estrutura.versoes]);
  const filtros = watch();
  const codigo = filtros.codigo.trim().toLocaleLowerCase("pt-BR");
  const nome = filtros.nome.trim().toLocaleLowerCase("pt-BR");
  const filtrados = estrutura.versoes.filter((versao) => (!codigo || (versao.codigoOrgao ?? versao.orgao).toLocaleLowerCase("pt-BR").includes(codigo)) && (!nome || `${versao.orgao} ${nomeOrgao(versao.orgao)}`.toLocaleLowerCase("pt-BR").includes(nome)) && (!filtros.situacao || versao.situacao === filtros.situacao));
  const paginaSegura = Math.min(pagina, Math.max(0, Math.ceil(filtrados.length / registrosPorPagina) - 1));
  const content = filtrados.slice(paginaSegura * registrosPorPagina, paginaSegura * registrosPorPagina + registrosPorPagina);
  const data: ResultsSeplag<VersaoOrganograma> = { content, last: (paginaSegura + 1) * registrosPorPagina >= filtrados.length, totalPages: Math.max(1, Math.ceil(filtrados.length / registrosPorPagina)), pageActual: paginaSegura, sizePage: registrosPorPagina, totalRecords: filtrados.length, size: registrosPorPagina, number: paginaSegura, first: paginaSegura === 0, numberOfElements: content.length, empty: content.length === 0 };
  const abrir = (versao: VersaoOrganograma) => navigate(`?modo=detalhe&orgao=${encodeURIComponent(versao.orgao)}&versao=${encodeURIComponent(versao.id)}`);
  const columns: ColumnMetaSeplag<VersaoOrganograma>[] = [
    { header: "Código do órgão", body: (versao) => <strong>{versao.codigoOrgao ?? versao.orgao}</strong> },
    { header: "Órgão/Entidade", body: (versao) => <div className="organograma-list-orgao"><strong>{nomeOrgao(versao.orgao)}</strong><small>{versao.orgao}</small></div> },
    { header: "Organograma", body: (versao) => <div className="organograma-list-orgao"><strong>{versao.nome}</strong><small>{versao.id}</small></div> },
    { header: "Vigência", body: (versao) => <span>{versao.inicio}{versao.fim ? ` a ${versao.fim}` : " a Atual"}</span> },
    { header: "Situação", body: (versao) => <BadgeSeplag label={versao.situacao === "VIGENTE" ? "Vigente" : versao.situacao === "RASCUNHO" ? "Rascunho" : "Encerrada"} color={versao.situacao === "VIGENTE" ? "#00843d" : versao.situacao === "RASCUNHO" ? "#9a6700" : "#64748b"} bg={versao.situacao === "VIGENTE" ? "#e2f3e8" : versao.situacao === "RASCUNHO" ? "#fff3cd" : "#f1f5f9"} border="transparent" size="md" /> },
  ];
  const cadastrar = () => {
    const orgaoSelecionado = orgaosParaCadastro.find((orgao) => orgao.value === watchNovo("orgao"));
    if (!orgaoSelecionado || !watchNovo("inicio") || !watchNovo("documentoLegalId")) { setErroCadastro("Informe o órgão/entidade, data de início e documento legal."); return; }
    const resultado = cadastrarOrganograma(orgaoSelecionado.value, orgaoSelecionado.codigo, watchNovo("inicio"), watchNovo("documentoLegalId"), watchNovo("nome"));
    if (!resultado.criado || !resultado.versao) { setErroCadastro("Este órgão já possui um organograma em rascunho. Conclua ou publique essa estrutura antes de criar outro rascunho."); return; }
    setEstrutura(resultado.estrutura); setModalCadastro(false); setErroCadastro(""); navigate(`?modo=detalhe&orgao=${encodeURIComponent(resultado.versao.orgao)}&versao=${encodeURIComponent(resultado.versao.id)}`);
  };
  return <div className="organograma-page organogramas-list-page"><CardSeplag title="Organogramas" cols="12" cardHeaderClassNames="prototype-carreira-card organograma-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Organogramas" }]} />}>
    <p className="organograma-intro">Consulte e mantenha as estruturas organizacionais cadastradas por órgão ou entidade.</p>
    <div className="prototype-category-filters prototype-cargo-filters grid"><TextFieldSeplag name="codigo" control={control} label="Código do órgão" placeholder="Digite o código" cols="12 6 3" getFormErrorMessage={semErro} /><TextFieldSeplag name="nome" control={control} label="Nome do órgão/entidade" placeholder="Digite o nome ou sigla" cols="12 6 4" getFormErrorMessage={semErro} /><DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Rascunho", value: "RASCUNHO" }, { label: "Vigente", value: "VIGENTE" }, { label: "Encerrada", value: "ENCERRADA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={semErro} /><div className="prototype-category-clear col-12 md:col-6 lg:col-3"><BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => { reset({ codigo: "", nome: "", situacao: "" }); setPagina(0); }} /></div></div>
    <div className="organograma-list-summary">{filtrados.length} {filtrados.length === 1 ? "organograma encontrado" : "organogramas encontrados"}</div>
    <div className="prototype-cargo-table organograma-list-table"><TablePaginadoSeplag dataKey="id" data={data} rows={registrosPorPagina} rowsPerPage={[registrosPorPagina]} columns={columns} lazy paginator selectionMode={null} hasEventoAcao handleAdicionar={() => { resetNovo({ orgao: "", inicio: "", documentoLegalId: "", nome: "" }); setErroCadastro(""); setModalCadastro(true); }} handleView={abrir} handleEdit={(versao) => navigate(`?modo=detalhe&orgao=${encodeURIComponent(versao.orgao)}&versao=${encodeURIComponent(versao.id)}&editar=true`)} handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))} /></div>
  </CardSeplag><ModalSeplag visible={modalCadastro} titulo="Cadastrar organograma" fechar={() => setModalCadastro(false)} labelFechar="Cancelar" labelAcao="Criar organograma" funcAcao={cadastrar} tamanho="760px"><div className="grid organograma-new-form">{erroCadastro && <p className="col-12 organograma-new-error">{erroCadastro}</p>}<DropdownFieldSeplag name="orgao" control={controlNovo} label="Órgão/Entidade" placeholder="Pesquise por código ou nome..." cols="12" required options={orgaosParaCadastro} optionLabel="label" optionValue="value" filter filterBy="label,codigo,nome,sigla" filterPlaceholder="Pesquisar por código ou nome" showClear getFormErrorMessage={semErro} /><TextFieldSeplag name="nome" control={controlNovo} label="Nome do organograma" placeholder="Ex.: Estrutura Organizacional CGE - 2026" cols="12" getFormErrorMessage={semErro} /><DateFieldSeplag name="inicio" control={controlNovo} label="Data de início da vigência" cols="12 6" required getFormErrorMessage={semErro} /><DropdownFieldSeplag name="documentoLegalId" control={controlNovo} label="Documento legal" placeholder="Selecione..." cols="12 6" required options={estrutura.documentosLegais.filter((documento) => documento.ativo).map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /></div></ModalSeplag></div>;
}

export function OrganogramaContent() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("modo") === "detalhe" ? <OrganogramaDetalheContent /> : <OrganogramasListagem />;
}
