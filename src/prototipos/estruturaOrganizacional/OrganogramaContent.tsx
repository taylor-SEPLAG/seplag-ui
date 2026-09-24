import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DateFieldSeplag, DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
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
  nivel: string;
  versaoComparacaoId: string;
};
type AdicionarUnidadeForm = { unidadeExistenteId: string; tipo: string; nivel: string; nome: string; sigla: string; documentoLegalId: string };

const opcoes = (valores: string[]) => valores.map((valor) => ({ label: valor, value: valor }));
const semErro = () => null;

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
      nivel: "Todos os níveis",
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
  const [erroAdicionar, setErroAdicionar] = useState("");
  const { control: controlAdicionar, watch: watchAdicionar, reset: resetAdicionar } = useForm<AdicionarUnidadeForm>({ defaultValues: { unidadeExistenteId: "", tipo: "", nivel: "", nome: "", sigla: "", documentoLegalId: "" } });
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
  const nivel = watch("nivel");

  useEffect(() => {
    if (versaoVigente && !versoesDoOrgao.some((versao) => versao.id === versaoIdForm)) setValue("versaoId", versaoVigente.id);
    setValue("nomeOrganograma", versaoSelecionada?.nome ?? "Organograma não cadastrado");
    setValue("documentoLegal", versaoSelecionada?.documentoLegal ?? "Documento legal não informado");
  }, [setValue, versaoIdForm, versaoSelecionada, versaoVigente, versoesDoOrgao]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return unidades.filter((unidade) =>
      (nivel === "Todos os níveis" || unidade.nivelOrganizacional === nivel) &&
      (!termo || `${unidade.codigo} ${unidade.nome} ${unidade.tipo} ${unidade.nivelOrganizacional}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)),
    );
  }, [busca, nivel]);

  const idsVisiveis = useMemo(() => {
    if (!busca.trim() && nivel === "Todos os níveis") return new Set(unidades.map((unidade) => unidade.id));
    const ids = new Set(filtradas.map((unidade) => unidade.id));
    filtradas.forEach((unidade) => {
      let superior = unidade.superiorId;
      while (superior) {
        ids.add(superior);
        superior = unidades.find((item) => item.id === superior)?.superiorId ?? null;
      }
    });
    return ids;
  }, [busca, filtradas, nivel]);

  const nomeSuperior = (unidade: Unidade) =>
    unidades.find((item) => item.id === unidade.superiorId)?.nome ?? "Órgão/Entidade";

  const filhosDe = (superiorId: number | null, itens = unidades) => itens.filter((item) => item.superiorId === superiorId).sort((a, b) => a.ordem - b.ordem);
  const indices = useMemo(() => {
    const resultado = new Map<number, string>();
    const preencher = (superiorId: number | null, prefixo: string) => filhosDe(superiorId).forEach((unidade, indice) => { const codigo = `${prefixo}.${indice + 1}`; resultado.set(unidade.id, codigo); preencher(unidade.id, codigo); });
    preencher(null, "1"); return resultado;
  }, [unidades]);
  const abrirAdicionar = (acao: "ABAIXO" | "IRMA", referencia: Unidade | null = null) => { resetAdicionar({ unidadeExistenteId: "", tipo: "", nivel: "", nome: "", sigla: "", documentoLegalId: versaoSelecionada?.documentoLegalId ?? "" }); setModoAdicionar("EXISTENTE"); setErroAdicionar(""); setModalAdicionar({ referencia, acao }); };

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
      if (!watchAdicionar("nome").trim() || !watchAdicionar("tipo") || !watchAdicionar("nivel") || !watchAdicionar("documentoLegalId")) { setErroAdicionar("Informe tipo, nível organizacional, nome e documento legal."); return; }
      setEstrutura(cadastrarUnidadeNoOrganograma(versaoSelecionada.id, { codigo: "", nome: watchAdicionar("nome").trim(), sigla: watchAdicionar("sigla").trim(), orgao: orgaoSelecionado, tipo: watchAdicionar("tipo"), nivelOrganizacional: watchAdicionar("nivel"), localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: versaoSelecionada.inicio, documentoCriacaoId: watchAdicionar("documentoLegalId"), documentosLegaisCriacaoIds: [watchAdicionar("documentoLegalId")], outraLocalidade: false }, contextoAdicionar.superiorId, contextoAdicionar.ordem));
    }
    setModalAdicionar(null); setErroAdicionar("");
  };

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
type NovoOrganogramaForm = { orgao: string; codigoOrgao: string; inicio: string; documentoLegalId: string; nome: string };
const nomeOrgao = (sigla: string) => sigla === "SEPLAG" ? "Secretaria de Estado de Planejamento e Gestão" : sigla === "SEDUC" ? "Secretaria de Estado de Educação" : sigla;

function OrganogramasListagem() {
  const navigate = useNavigate();
  const [estrutura, setEstrutura] = useState(lerEstruturaOrganizacional);
  const [pagina, setPagina] = useState(0);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const registrosPorPagina = 10;
  const { control, watch, reset } = useForm<FiltrosListagem>({ defaultValues: { codigo: "", nome: "", situacao: "" } });
  const { control: controlNovo, watch: watchNovo, reset: resetNovo } = useForm<NovoOrganogramaForm>({ defaultValues: { orgao: "", codigoOrgao: "", inicio: "", documentoLegalId: "", nome: "" } });
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
    if (!watchNovo("orgao") || !watchNovo("codigoOrgao").trim() || !watchNovo("inicio") || !watchNovo("documentoLegalId")) { setErroCadastro("Informe o código, órgão/entidade, data de início e documento legal."); return; }
    const resultado = cadastrarOrganograma(watchNovo("orgao"), watchNovo("codigoOrgao").trim(), watchNovo("inicio"), watchNovo("documentoLegalId"), watchNovo("nome"));
    if (!resultado.criado || !resultado.versao) { setErroCadastro("Este órgão já possui um organograma em rascunho. Conclua ou publique essa estrutura antes de criar outro rascunho."); return; }
    setEstrutura(resultado.estrutura); setModalCadastro(false); setErroCadastro(""); navigate(`?modo=detalhe&orgao=${encodeURIComponent(resultado.versao.orgao)}&versao=${encodeURIComponent(resultado.versao.id)}`);
  };
  return <div className="organograma-page organogramas-list-page"><CardSeplag title="Organogramas" cols="12" cardHeaderClassNames="prototype-carreira-card organograma-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Organogramas" }]} />}>
    <p className="organograma-intro">Consulte e mantenha as estruturas organizacionais cadastradas por órgão ou entidade.</p>
    <div className="prototype-category-filters prototype-cargo-filters grid"><TextFieldSeplag name="codigo" control={control} label="Código do órgão" placeholder="Digite o código" cols="12 6 3" getFormErrorMessage={semErro} /><TextFieldSeplag name="nome" control={control} label="Nome do órgão/entidade" placeholder="Digite o nome ou sigla" cols="12 6 4" getFormErrorMessage={semErro} /><DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Rascunho", value: "RASCUNHO" }, { label: "Vigente", value: "VIGENTE" }, { label: "Encerrada", value: "ENCERRADA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={semErro} /><div className="prototype-category-clear col-12 md:col-6 lg:col-3"><BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => { reset({ codigo: "", nome: "", situacao: "" }); setPagina(0); }} /></div></div>
    <div className="organograma-list-summary">{filtrados.length} {filtrados.length === 1 ? "organograma encontrado" : "organogramas encontrados"}</div>
    <div className="prototype-cargo-table organograma-list-table"><TablePaginadoSeplag dataKey="id" data={data} rows={registrosPorPagina} rowsPerPage={[registrosPorPagina]} columns={columns} lazy paginator selectionMode={null} hasEventoAcao handleAdicionar={() => { resetNovo({ orgao: "", codigoOrgao: "", inicio: "", documentoLegalId: "", nome: "" }); setErroCadastro(""); setModalCadastro(true); }} handleView={abrir} handleEdit={(versao) => navigate(`?modo=detalhe&orgao=${encodeURIComponent(versao.orgao)}&versao=${encodeURIComponent(versao.id)}&editar=true`)} handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))} /></div>
  </CardSeplag><ModalSeplag visible={modalCadastro} titulo="Cadastrar organograma" fechar={() => setModalCadastro(false)} labelFechar="Cancelar" labelAcao="Criar organograma" funcAcao={cadastrar} tamanho="760px"><div className="grid organograma-new-form">{erroCadastro && <p className="col-12 organograma-new-error">{erroCadastro}</p>}<TextFieldSeplag name="codigoOrgao" control={controlNovo} label="Código do órgão" placeholder="Ex.: 003" cols="12 6" required getFormErrorMessage={semErro} /><DropdownFieldSeplag name="orgao" control={controlNovo} label="Órgão/Entidade" placeholder="Selecione..." cols="12 6" required options={opcoes(["SEPLAG", "SEDUC", "CGE", "DETRAN-MT", "MTI"])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /><TextFieldSeplag name="nome" control={controlNovo} label="Nome do organograma" placeholder="Ex.: Estrutura Organizacional CGE - 2026" cols="12" getFormErrorMessage={semErro} /><DateFieldSeplag name="inicio" control={controlNovo} label="Data de início da vigência" cols="12 6" required getFormErrorMessage={semErro} /><DropdownFieldSeplag name="documentoLegalId" control={controlNovo} label="Documento legal" placeholder="Selecione..." cols="12 6" required options={estrutura.documentosLegais.filter((documento) => documento.ativo).map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} /></div></ModalSeplag></div>;
}

export function OrganogramaContent() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("modo") === "detalhe" ? <OrganogramaDetalheContent /> : <OrganogramasListagem />;
}
