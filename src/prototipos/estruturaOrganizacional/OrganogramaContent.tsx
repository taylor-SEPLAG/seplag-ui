import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DateFieldSeplag, DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { ModalSeplag } from "@componentes/Modal";
import { PanelSeplag } from "@componentes/PanelSeplag";
import "./organograma.css";

type Unidade = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  nivel: string;
  superior: string | null;
  inicioUnidade: string;
  fimUnidade?: string;
  inicioPosicao: string;
  fimPosicao?: string;
  atoLegal: string;
};

type Filtros = {
  orgao: string;
  nomeOrganograma: string;
  documentoLegal: string;
  busca: string;
  nivel: string;
  dataAnterior: string;
  dataAtual: string;
};

const unidades: Unidade[] = [
  { id: "DS001", codigo: "DS001", nome: "Secretaria de Estado de Planejamento e Gestão", tipo: "Secretaria de Estado", nivel: "Direção Superior", superior: null, inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "DS002", codigo: "DS002", nome: "Gabinete do Secretário de Estado", tipo: "Gabinete", nivel: "Direção Superior", superior: "DS001", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "DS010", codigo: "DS010", nome: "Secretaria Adjunta de Planejamento e Governo Digital", tipo: "Secretaria Adjunta", nivel: "Direção Superior", superior: "DS002", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "DS011", codigo: "DS011", nome: "Secretaria Adjunta de Gestão de Pessoas", tipo: "Secretaria Adjunta", nivel: "Direção Superior", superior: "DS002", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "DS012", codigo: "DS012", nome: "Secretaria Adjunta de Aquisições Governamentais", tipo: "Secretaria Adjunta", nivel: "Direção Superior", superior: "DS002", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "DS013", codigo: "DS013", nome: "Secretaria Adjunta de Administração Sistêmica", tipo: "Secretaria Adjunta", nivel: "Direção Superior", superior: "DS002", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "AE020", codigo: "AE020", nome: "Unidade Setorial de Controle Interno - UNISECI", tipo: "Unidade", nivel: "Apoio Estratégico", superior: "DS002", inicioUnidade: "15/03/2021", inicioPosicao: "15/03/2021", atoLegal: "Decreto nº 2.185/2026" },
  { id: "AE021", codigo: "AE021", nome: "Ouvidoria Setorial", tipo: "Ouvidoria", nivel: "Apoio Estratégico", superior: "DS002", inicioUnidade: "15/03/2021", inicioPosicao: "15/03/2021", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP100", codigo: "EP100", nome: "Superintendência de Planejamento Estadual", tipo: "Superintendência", nivel: "Execução Programática", superior: "DS010", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP104", codigo: "EP104", nome: "Superintendência de Governança Digital", tipo: "Superintendência", nivel: "Execução Programática", superior: "DS010", inicioUnidade: "10/05/2022", inicioPosicao: "10/05/2022", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP108", codigo: "EP108", nome: "Superintendência de Modernização Organizacional", tipo: "Superintendência", nivel: "Execução Programática", superior: "DS010", inicioUnidade: "10/05/2022", inicioPosicao: "10/05/2022", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP109", codigo: "EP109", nome: "Coordenadoria de Modelagem Organizacional", tipo: "Coordenadoria", nivel: "Execução Programática", superior: "EP104", inicioUnidade: "15/01/2026", inicioPosicao: "15/01/2026", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP200", codigo: "EP200", nome: "Superintendência de Provimento, Aplicação e Monitoramento", tipo: "Superintendência", nivel: "Execução Programática", superior: "DS011", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
  { id: "EP201", codigo: "EP201", nome: "Coordenadoria de Provimento", tipo: "Coordenadoria", nivel: "Execução Programática", superior: "EP200", inicioUnidade: "01/01/2020", inicioPosicao: "01/01/2020", atoLegal: "Decreto nº 2.185/2026" },
];

const comparacoes = [
  { status: "incluida", codigo: "EP109", nome: "Coordenadoria de Modelagem Organizacional", anterior: "Não existia", atual: "Subordinada à Superintendência de Governança Digital", documento: "Decreto nº 2.185/2026" },
  { status: "alterada", codigo: "EP104", nome: "Superintendência de Governança Digital", anterior: "Subordinada ao Gabinete do Secretário", atual: "Subordinada à Secretaria Adjunta de Planejamento", documento: "Decreto nº 2.185/2026" },
  { status: "removida", codigo: "EP099", nome: "Coordenadoria de Informática Legada", anterior: "Subordinada à Secretaria Adjunta de Planejamento", atual: "Unidade extinta", documento: "Vigência encerrada em 31/12/2025" },
] as const;

const opcoes = (valores: string[]) => valores.map((valor) => ({ label: valor, value: valor }));
const semErro = () => null;

export function OrganogramaContent() {
  const { control, watch } = useForm<Filtros>({
    defaultValues: {
      orgao: "SEPLAG - Secretaria de Estado de Planejamento e Gestão",
      nomeOrganograma: "Estrutura Organizacional SEPLAG - 2026",
      documentoLegal: "Decreto nº 2.185, de 03/07/2026",
      busca: "",
      nivel: "Todos os níveis",
      dataAnterior: "2025-01-01",
      dataAtual: "2026-09-14",
    },
  });
  const [visao, setVisao] = useState<"arvore" | "lista">("arvore");
  const [comparar, setComparar] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [selecionada, setSelecionada] = useState<Unidade | null>(null);
  const busca = watch("busca");
  const nivel = watch("nivel");
  const dataAnterior = watch("dataAnterior");
  const dataAtual = watch("dataAtual");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return unidades.filter((unidade) =>
      (nivel === "Todos os níveis" || unidade.nivel === nivel) &&
      (!termo || `${unidade.codigo} ${unidade.nome} ${unidade.tipo} ${unidade.nivel}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)),
    );
  }, [busca, nivel]);

  const idsVisiveis = useMemo(() => {
    if (!busca.trim() && nivel === "Todos os níveis") return new Set(unidades.map((unidade) => unidade.id));
    const ids = new Set(filtradas.map((unidade) => unidade.id));
    filtradas.forEach((unidade) => {
      let superior = unidade.superior;
      while (superior) {
        ids.add(superior);
        superior = unidades.find((item) => item.id === superior)?.superior ?? null;
      }
    });
    return ids;
  }, [busca, filtradas, nivel]);

  const nomeSuperior = (unidade: Unidade) =>
    unidades.find((item) => item.id === unidade.superior)?.nome ?? "Sem unidade superior";

  const profundidade = (unidade: Unidade) => {
    let valor = 0;
    let superior = unidade.superior;
    while (superior) {
      valor += 1;
      superior = unidades.find((item) => item.id === superior)?.superior ?? null;
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
    const filhos = unidades.filter(
      (item) => item.superior === unidade.id && idsVisiveis.has(item.id),
    );
    return (
      <div className="organograma-tree-wrap">
        <button
          type="button"
          className={`organograma-tree-node ${raiz ? "is-root" : ""}`}
          onClick={() => setSelecionada(unidade)}
        >
          <span>{unidade.codigo}</span>
          <strong>{unidade.nome}</strong>
          <small>{unidade.tipo}</small>
        </button>
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
      </div>
    );
  };

  const raiz = unidades[0];
  const formatarData = (data: string) =>
    data ? data.split("-").reverse().join("/") : "Não informada";

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
              options={opcoes([
                "SEPLAG - Secretaria de Estado de Planejamento e Gestão",
                "SEDUC - Secretaria de Estado de Educação",
                "SESP - Secretaria de Estado de Segurança Pública",
              ])}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={semErro}
            />
            <TextFieldSeplag name="nomeOrganograma" control={control} label="Nome do organograma" cols="12 12 3" disabled getFormErrorMessage={semErro} />
            <TextFieldSeplag name="documentoLegal" control={control} label="Documento legal" cols="12 12 3" disabled getFormErrorMessage={semErro} />
          </div>
        </PanelSeplag>

        <PanelSeplag className="organograma-panel organograma-consulta">
          <div className="organograma-toolbar">
            <div className="organograma-view-switch" aria-label="Modo de visualização">
              <BotaoSeplag label="Organograma" icon="pi pi-sitemap" outlined={visao !== "arvore"} onClick={() => setVisao("arvore")} />
              <BotaoSeplag label="Árvore / Lista" icon="pi pi-list" outlined={visao !== "lista"} onClick={() => setVisao("lista")} />
              <BotaoSeplag label={expandido ? "Fechar tela cheia" : "Expandir"} icon={expandido ? "pi pi-times" : "pi pi-window-maximize"} outlined onClick={() => setExpandido((valor) => !valor)} />
              <BotaoSeplag label="Exportar PDF" icon="pi pi-file-pdf" outlined onClick={exportarPdf} />
            </div>
          </div>
          <div className="grid organograma-filters">
            <TextFieldSeplag name="busca" control={control} label="Pesquisar unidade" placeholder="Buscar por código, nome, tipo ou nível" cols="12 6 5" getFormErrorMessage={semErro} />
            <DropdownFieldSeplag name="nivel" control={control} label="Filtrar por nível" cols="12 6 3" options={opcoes(["Todos os níveis", "Direção Superior", "Apoio Estratégico", "Execução Programática"])} optionLabel="label" optionValue="value" getFormErrorMessage={semErro} />
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
              <DateFieldSeplag name="dataAnterior" control={control} label="Data anterior (base)" cols="12 6" getFormErrorMessage={semErro} />
              <DateFieldSeplag name="dataAtual" control={control} label="Data atual/alvo" cols="12 6" getFormErrorMessage={semErro} />
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
              <div className="organograma-tree">
                {idsVisiveis.has(raiz.id) ? <NoArvore unidade={raiz} raiz /> : <p>Nenhuma unidade encontrada.</p>}
              </div>
            </div>
          ) : comparar ? (
            <div className="organograma-table-scroll">
              <table className="organograma-table organograma-comparison-table">
                <thead><tr><th>Status da alteração</th><th>Código e nome da unidade</th><th>Estrutura anterior ({formatarData(dataAnterior)})</th><th>Estrutura atual ({formatarData(dataAtual)})</th><th>Documento/observação</th></tr></thead>
                <tbody>
                  {comparacoes.map((item) => (
                    <tr className={`is-${item.status}`} key={item.codigo}>
                      <td><span className={`organograma-status is-${item.status}`}>{item.status === "incluida" ? "Incluída" : item.status === "removida" ? "Removida" : "Alterada"}</span></td>
                      <td><strong>{item.codigo}</strong><span>{item.nome}</span></td>
                      <td>{item.anterior}</td><td>{item.atual}</td><td>{item.documento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="organograma-hierarchy-list">
              {filtradas.map((unidade) => (
                <button type="button" key={unidade.id} className="organograma-hierarchy-row" style={{ paddingLeft: `${12 + profundidade(unidade) * 22}px` }} onClick={() => setSelecionada(unidade)}>
                  <strong>{unidade.codigo} - {unidade.nome}</strong>
                  <span>{unidade.nivel} <i>•</i> Superior: {nomeSuperior(unidade)}</span>
                </button>
              ))}
              {filtradas.length === 0 && <p className="organograma-empty">Nenhuma unidade encontrada.</p>}
            </div>
          )}
          <div className="organograma-result-summary">
            {visao === "lista" && !comparar && `${filtradas.length} ${filtradas.length === 1 ? "unidade encontrada" : "unidades encontradas"}`}
            {visao === "lista" && comparar && `${comparacoes.length} alterações identificadas no período`}
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
            <header><span>{selecionada.codigo}</span><h3>{selecionada.nome}</h3></header>
            <dl>
              <div><dt>Tipo de unidade</dt><dd>{selecionada.tipo}</dd></div>
              <div><dt>Nível organizacional</dt><dd>{selecionada.nivel}</dd></div>
              <div><dt>Unidade superior</dt><dd>{nomeSuperior(selecionada)}</dd></div>
              <div><dt>Ato legal</dt><dd>{selecionada.atoLegal}</dd></div>
            </dl>
            <div className="organograma-validity">
              <article><strong>Vigência da unidade</strong><span>{selecionada.inicioUnidade} a {selecionada.fimUnidade ?? "Atual"}</span></article>
              <article><strong>Vigência da posição hierárquica</strong><span>{selecionada.inicioPosicao} a {selecionada.fimPosicao ?? "Atual"}</span></article>
            </div>
          </div>
        )}
      </ModalSeplag>
    </div>
  );
}
