import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CardSeplag } from "../../componentes/Card";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { ModalSeplag } from "../../componentes/Modal";
import { TabsSeplag } from "../../componentes/Tabs";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { PaginacaoV2 } from "../vinculos/VinculoV2Page";
import { carregarFontesPasta, usuarioPasta } from "./sources";
import {
  anexarDocumentoManual,
  EVENTO_PASTA,
  listarDocumentosPersistidos,
  obterArquivo,
} from "./pastaFuncionalStore";
import {
  cpfChave,
  dataBR,
  dataHora,
  diaLocal,
  documentosDoServidor,
  filtrosDocumentosVazios,
  filtrosServidoresVazios,
  filtrarDocumentos,
  normalizar,
  podeConsultarVinculo,
  vinculosFiltrados,
  type FiltrosDocumentos,
  type FiltrosServidores,
} from "./model";
import {
  CATEGORIAS,
  TIPOS_DOCUMENTO,
  type Categoria,
  type DocumentoFuncional,
  type SituacaoPasta,
} from "./types";
import "../vinculos/vinculoV2.css";
import "./pastaFuncional.css";

const BASE = "/prototipos/sigep/pasta-funcional";
const tamanho = (bytes?: number) =>
  bytes === undefined
    ? ""
    : bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const numero = (valor: number) => valor.toLocaleString("pt-BR");
function Tag({ situacao }: { situacao: SituacaoPasta }) {
  return (
    <span
      className={`v2v-status v2v-status-${situacao === "Ativo" ? "ativo" : "encerrado"}`}
    >
      {situacao}
    </span>
  );
}

export function PastaFuncionalPage() {
  const { servidorId } = useParams();
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="prototype-page-content prototype-page-content--white v2v-shell">
        <ConteudoPasta key={servidorId ?? "consulta"} servidorId={servidorId} />
      </main>
    </PrototypeSystemPage>
  );
}

function ConteudoPasta({ servidorId }: { servidorId?: string }) {
  const [params, setParams] = useSearchParams();
  const [fontes, setFontes] = useState(carregarFontesPasta);
  const [documentos, setDocumentos] = useState(fontes.documentos);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const usuario = usuarioPasta();
  const ordem = useRef(0);
  useEffect(() => {
    const atualizar = async () => {
      const tentativa = ++ordem.current;
      const novasFontes = carregarFontesPasta();
      setFontes(novasFontes);
      try {
        const salvos = await listarDocumentosPersistidos();
        if (tentativa !== ordem.current) return;
        setDocumentos([
          ...new Map(
            [...novasFontes.documentos, ...salvos]
              .filter((d) => d.validado)
              .map((d) => [d.id, d]),
          ).values(),
        ]);
      } catch (e) {
        if (tentativa === ordem.current) {
          setDocumentos(novasFontes.documentos);
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar os anexos locais.",
          );
        }
      }
    };
    void atualizar();
    window.addEventListener("focus", atualizar);
    window.addEventListener("storage", atualizar);
    window.addEventListener(EVENTO_PASTA, atualizar);
    return () => {
      ++ordem.current;
      window.removeEventListener("focus", atualizar);
      window.removeEventListener("storage", atualizar);
      window.removeEventListener(EVENTO_PASTA, atualizar);
    };
  }, []);
  const filtros = Object.fromEntries(
    Object.keys(filtrosServidoresVazios).map((campo) => [
      campo,
      params.get(campo) ?? "",
    ]),
  ) as FiltrosServidores;
  const [rascunho, setRascunho] = useState(filtros);
  const porPagina = [10, 20, 50].includes(Number(params.get("porPagina")))
    ? Number(params.get("porPagina"))
    : 10;
  const permitidos = fontes.servidores.filter(
    (s) =>
      usuario.perfil === "CENTRAL" ||
      s.vinculos.some((v) => podeConsultarVinculo(usuario, v)),
  );
  const resultados = permitidos.flatMap((s) => {
    const lista = vinculosFiltrados(s, filtros, usuario);
    if (
      !lista.length &&
      (s.vinculos.length ||
        filtros.tipo ||
        filtros.orgao ||
        filtros.situacao ||
        (filtros.busca &&
          !normalizar(s.nome).includes(normalizar(filtros.busca)) &&
          !(
            cpfChave(filtros.busca).length > 0 &&
            cpfChave(s.cpf).includes(cpfChave(filtros.busca))
          )))
    )
      return [];
    const principal = [...lista].sort(
      (a, b) => Number(b.situacao === "Ativo") - Number(a.situacao === "Ativo"),
    )[0];
    return [
      {
        servidor: s,
        vinculo: principal,
        documentos: documentosDoServidor(documentos, s, usuario),
      },
    ];
  });
  const totalPaginas = Math.max(1, Math.ceil(resultados.length / porPagina));
  const pagina = Math.min(
    Math.max(1, Number(params.get("pagina")) || 1),
    totalPaginas,
  );
  const servidor = fontes.servidores.find((s) => s.id === servidorId);
  const vinculosPermitidos =
    servidor?.vinculos.filter((v) => podeConsultarVinculo(usuario, v)) ?? [];
  const vinculo =
    vinculosPermitidos.find((v) => v.id === params.get("vinculo")) ??
    vinculosPermitidos[0];
  const acesso =
    servidor && (usuario.perfil === "CENTRAL" || vinculosPermitidos.length > 0);
  const docsServidor =
    servidor && acesso
      ? documentosDoServidor(documentos, servidor, usuario, vinculo?.id)
      : [];
  const [aba, setAba] = useState<Categoria | "Todos">("Todos");
  const [filtrosDocs, setFiltrosDocs] = useState<FiltrosDocumentos>(
    filtrosDocumentosVazios,
  );
  const [paginaDocs, setPaginaDocs] = useState(1);
  const [porPaginaDocs, setPorPaginaDocs] = useState(10);
  const docsAba = docsServidor.filter(
    (d) => aba === "Todos" || d.categoria === aba,
  );
  const docsFiltrados = filtrarDocumentos(docsServidor, aba, filtrosDocs);
  const paginasDocs = Math.max(
    1,
    Math.ceil(docsFiltrados.length / porPaginaDocs),
  );
  const paginaDocsAtual = Math.min(paginaDocs, paginasDocs);
  const [detalhe, setDetalhe] = useState<DocumentoFuncional | null>(null);
  const [visualizacao, setVisualizacao] = useState<{
    doc: DocumentoFuncional;
    url: string;
    texto?: string;
    tipo: string;
  } | null>(null);
  useEffect(
    () => () => {
      if (visualizacao) URL.revokeObjectURL(visualizacao.url);
    },
    [visualizacao],
  );
  const [anexarAberto, setAnexarAberto] = useState(false);
  const [categoria, setCategoria] =
    useState<Exclude<Categoria, "Ingresso">>("Documentos Gerais");
  const [tipoDocumento, setTipoDocumento] = useState(
    TIPOS_DOCUMENTO["Documentos Gerais"][0],
  );
  const [dataDocumento, setDataDocumento] = useState("");
  const [relacionado, setRelacionado] = useState(vinculo?.id ?? "");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [observacao, setObservacao] = useState("");
  const [erroAnexo, setErroAnexo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [chaveUpload, setChaveUpload] = useState(0);
  const parametrosConsulta = new URLSearchParams(params);
  parametrosConsulta.delete("vinculo");
  const consultaUrl = `${BASE}${parametrosConsulta.size ? `?${parametrosConsulta}` : ""}`;
  const pesquisar = (e: FormEvent) => {
    e.preventDefault();
    const novos = new URLSearchParams(
      Object.entries(rascunho).filter(([, v]) => v),
    );
    novos.set("porPagina", String(porPagina));
    setParams(novos);
  };
  const atualizarDocs = (campo: keyof FiltrosDocumentos, valor: string) => {
    setFiltrosDocs((atual) => ({ ...atual, [campo]: valor }));
    setPaginaDocs(1);
  };
  const abrirPasta = (id: string, idVinculo?: string) => {
    const novos = new URLSearchParams(params);
    if (idVinculo) novos.set("vinculo", idVinculo);
    return `${BASE}/${id}${novos.size ? `?${novos}` : ""}`;
  };
  const visualizar = async (doc: DocumentoFuncional) => {
    try {
      const blob = await obterArquivo(doc);
      setVisualizacao({
        doc,
        tipo: blob.type,
        url: URL.createObjectURL(blob),
        texto: blob.type.startsWith("text/plain")
          ? await blob.text()
          : undefined,
      });
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível abrir o documento.",
      );
    }
  };
  const baixar = async (doc: DocumentoFuncional) => {
    try {
      const blob = await obterArquivo(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.arquivoNome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível baixar o documento.",
      );
    }
  };
  const abrirAnexo = () => {
    setCategoria("Documentos Gerais");
    setTipoDocumento(TIPOS_DOCUMENTO["Documentos Gerais"][0]);
    setRelacionado(vinculo?.id ?? "");
    setDataDocumento("");
    setArquivo(null);
    setObservacao("");
    setErroAnexo("");
    setChaveUpload((c) => c + 1);
    setAnexarAberto(true);
  };
  const salvarAnexo = async (e: FormEvent) => {
    e.preventDefault();
    if (!servidor || !acesso || !usuario.podeAnexar || salvando) return;
    if (!arquivo) {
      setErroAnexo("Selecione o arquivo do documento.");
      return;
    }
    if (
      categoria !== "Cadastrais" &&
      categoria !== "Documentos Gerais" &&
      !relacionado
    ) {
      setErroAnexo("Selecione o vínculo relacionado.");
      return;
    }
    if (
      categoria !== "Cadastrais" &&
      relacionado &&
      !vinculosPermitidos.some((v) => v.id === relacionado)
    ) {
      setErroAnexo("Vínculo relacionado não autorizado.");
      return;
    }
    setSalvando(true);
    setErroAnexo("");
    try {
      const doc = await anexarDocumentoManual(
        {
          cpf: servidor.cpf,
          nome: tipoDocumento,
          categoria,
          tipoDocumento,
          vinculoId:
            categoria === "Cadastrais" ? undefined : relacionado || undefined,
          dataDocumento: dataDocumento || undefined,
          arquivoNome: arquivo.name,
          arquivoTipo: arquivo.type,
          observacao,
        },
        arquivo,
        usuario,
      );
      setDocumentos((atuais) => [
        ...atuais.filter((d) => d.id !== doc.id),
        doc,
      ]);
      setAba(categoria);
      setFiltrosDocs(filtrosDocumentosVazios);
      setPaginaDocs(1);
      if (doc.vinculoId) {
        const novos = new URLSearchParams(params);
        novos.set("vinculo", doc.vinculoId);
        setParams(novos, { replace: true });
      }
      setAnexarAberto(false);
      setSucesso("Documento anexado com sucesso.");
    } catch (e) {
      setErroAnexo(
        e instanceof Error ? e.message : "Não foi possível anexar o documento.",
      );
    } finally {
      setSalvando(false);
    }
  };
  const dadosDetalhe = detalhe
    ? {
        "Nome do documento": detalhe.nome,
        Categoria: detalhe.categoria,
        "Tipo do documento": detalhe.tipoDocumento,
        Origem: detalhe.origem,
        "Módulo de origem": detalhe.moduloOrigem,
        Servidor: servidor?.nome ?? "—",
        CPF: detalhe.cpf,
        Matrícula: detalhe.vinculoId
          ? (servidor?.vinculos.find((v) => v.id === detalhe.vinculoId)
              ?.matricula ?? "—")
          : "Pessoa Física",
        "Nº do Vínculo": detalhe.vinculoId
          ? (servidor?.vinculos.find((v) => v.id === detalhe.vinculoId)
              ?.numero ?? "—")
          : "Não se aplica",
        "Nº do Ingresso": detalhe.numeroIngresso ?? "—",
        "Evento funcional de origem": detalhe.evento ?? "—",
        "Data do Documento": dataBR(detalhe.dataDocumento),
        "Data/Hora do Anexo": dataHora(detalhe.anexadoEm),
        "Anexado por": detalhe.anexadoPor,
        "Órgão responsável": detalhe.orgaoResponsavel,
        "Nome do arquivo": detalhe.arquivoNome,
        Observação: detalhe.observacao || "—",
        "Identificador do registro de origem": detalhe.origemId,
        "Identificador externo": detalhe.identificadorExterno ?? "—",
      }
    : {};
  return (
    <CardSeplag
      title="Pasta Funcional do Servidor"
      cols="12"
      cardHeaderClassNames="prototype-carreira-card v2v-card"
      headerNavigation={
        <BreadcrumbSeplag
          divided
          homeTo="/prototipos/sigep"
          items={[
            {
              label: "Vínculos Funcionais",
              to: "/prototipos/sigep/vinculos-funcionais",
            },
            { label: "Pasta Funcional do Servidor", to: consultaUrl },
            ...(servidor ? [{ label: servidor.nome }] : []),
          ]}
        />
      }
    >
      <div className="v2v-page pf-page">
        <p className="v2v-description">
          {servidorId
            ? "Consulte e gerencie todos os documentos já validados vinculados à vida funcional do servidor."
            : "Consulte os servidores e acesse todos os documentos vinculados à sua vida funcional."}
        </p>
        {erro && (
          <div className="pf-feedback" role="alert">
            {erro}
            <button
              type="button"
              aria-label="Fechar mensagem"
              onClick={() => setErro("")}
            >
              <i className="pi pi-times" />
            </button>
          </div>
        )}
        {sucesso && (
          <p className="pf-success" role="status">
            {sucesso}
          </p>
        )}
        {!servidorId ? (
          <>
            <section
              className="v2v-kpis"
              aria-label="Indicadores da Pasta Funcional"
            >
              {[
                [
                  "Servidores com documentos",
                  permitidos.filter(
                    (s) => documentosDoServidor(documentos, s, usuario).length,
                  ).length,
                  "pi-users",
                ],
                [
                  "Total de documentos",
                  permitidos.reduce(
                    (total, s) =>
                      total +
                      documentosDoServidor(documentos, s, usuario).length,
                    0,
                  ),
                  "pi-file",
                ],
                [
                  "Documentos anexados hoje",
                  permitidos
                    .flatMap((s) =>
                      documentosDoServidor(documentos, s, usuario),
                    )
                    .filter(
                      (d) => diaLocal(d.anexadoEm) === diaLocal(new Date()),
                    ).length,
                  "pi-calendar",
                ],
              ].map(([rotulo, valor, icone]) => (
                <article className="pf-kpi" key={rotulo}>
                  <i className={`pi ${icone}`} aria-hidden="true" />
                  <div>
                    <span>{rotulo}</span>
                    <strong>{numero(Number(valor))}</strong>
                  </div>
                </article>
              ))}
            </section>
            <form
              className="v2v-panel v2v-filters pf-server-filters"
              onSubmit={pesquisar}
              aria-label="Filtros da consulta de servidores"
            >
              <label>
                Nome / CPF / Matrícula
                <input
                  placeholder="Digite o nome, CPF ou matrícula..."
                  value={rascunho.busca}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, busca: e.target.value })
                  }
                />
              </label>
              <label>
                Tipo de Vínculo
                <select
                  value={rascunho.tipo}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, tipo: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  {[
                    ...new Set(
                      permitidos.flatMap((s) => s.vinculos.map((v) => v.tipo)),
                    ),
                  ].map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>
              <label>
                Órgão/Entidade
                <select
                  value={rascunho.orgao}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, orgao: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  {[
                    ...new Set(
                      permitidos.flatMap((s) =>
                        s.vinculos
                          .filter((v) => podeConsultarVinculo(usuario, v))
                          .map((v) => v.orgao),
                      ),
                    ),
                  ]
                    .sort()
                    .map((orgao) => (
                      <option key={orgao}>{orgao}</option>
                    ))}
                </select>
              </label>
              <label>
                Situação do Vínculo
                <select
                  value={rascunho.situacao}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, situacao: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option>Ativo</option>
                  <option>Encerrado</option>
                  {permitidos.some((s) =>
                    s.vinculos.some((v) => v.situacao === "Falecido"),
                  ) && <option>Falecido</option>}
                </select>
              </label>
              <div className="v2v-filter-actions">
                <button type="submit" className="v2v-primary">
                  <i className="pi pi-search" aria-hidden="true" />
                  Pesquisar
                </button>
                <button
                  type="button"
                  className="v2v-secondary"
                  onClick={() => {
                    setRascunho(filtrosServidoresVazios);
                    setParams({});
                  }}
                >
                  <i className="pi pi-refresh" aria-hidden="true" />
                  Limpar filtros
                </button>
              </div>
            </form>
            <section className="v2v-panel pf-grid">
              <header className="pf-section-head">
                <h2>Resultados</h2>
                <span>
                  {numero(resultados.length)} registro(s) encontrado(s)
                </span>
              </header>
              <div className="v2v-table-wrap">
                <table className="v2v-table">
                  <thead>
                    <tr>
                      {[
                        "Matrícula",
                        "Servidor",
                        "CPF",
                        "Tipo de Vínculo",
                        "Situação",
                        "Órgão/Entidade",
                        "Qtd. Documentos",
                        "Última Atualização",
                        "Ações",
                      ].map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultados
                      .slice((pagina - 1) * porPagina, pagina * porPagina)
                      .map(({ servidor: s, vinculo: v, documentos: docs }) => (
                        <tr key={s.id}>
                          <td>{v?.matricula ?? "—"}</td>
                          <td>
                            {s.nome}
                            {s.vinculos.length > 1 && (
                              <small className="pf-cell-note">
                                {s.vinculos.length} vínculos
                              </small>
                            )}
                          </td>
                          <td>{s.cpf}</td>
                          <td>{v?.tipo ?? "—"}</td>
                          <td>{v ? <Tag situacao={v.situacao} /> : "—"}</td>
                          <td>{v?.orgao ?? "—"}</td>
                          <td>{docs.length}</td>
                          <td>
                            {dataHora(
                              docs
                                .map((d) => d.anexadoEm)
                                .sort((a, b) => Date.parse(a) - Date.parse(b))
                                .at(-1),
                            )}
                          </td>
                          <td>
                            <Link
                              className="v2v-icon-action pf-icon"
                              to={abrirPasta(s.id, v?.id)}
                              title="Ver documentos"
                              aria-label={`Ver documentos de ${s.nome}`}
                            >
                              <i className="pi pi-eye" aria-hidden="true" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    {!resultados.length && (
                      <tr>
                        <td colSpan={9} className="v2v-empty">
                          Nenhum servidor encontrado para os filtros informados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginacaoV2
                nome="servidores da Pasta Funcional"
                pagina={pagina}
                totalPaginas={totalPaginas}
                porPagina={porPagina}
                mudarPagina={(nova) => {
                  const p = new URLSearchParams(params);
                  p.set("pagina", String(nova));
                  setParams(p);
                }}
                mudarPorPagina={(nova) => {
                  const p = new URLSearchParams(params);
                  p.set("porPagina", String(nova));
                  p.delete("pagina");
                  setParams(p);
                }}
              />
            </section>
          </>
        ) : !servidor || !acesso ? (
          <p role="alert" className="v2v-notice">
            Servidor não encontrado ou acesso não autorizado para este perfil.
          </p>
        ) : (
          <>
            <section className="v2v-panel pf-server-summary">
              <header className="pf-section-head">
                <h2>{servidor.nome}</h2>
                {usuario.podeAnexar && (
                  <button
                    className="v2v-primary"
                    type="button"
                    onClick={abrirAnexo}
                  >
                    <i className="pi pi-plus" aria-hidden="true" />
                    Anexar documento
                  </button>
                )}
              </header>
              {vinculosPermitidos.length > 1 && (
                <label className="pf-link-selector">
                  Vínculo consultado
                  <select
                    value={vinculo?.id ?? ""}
                    onChange={(e) => {
                      const p = new URLSearchParams(params);
                      p.set("vinculo", e.target.value);
                      setParams(p);
                      setFiltrosDocs(filtrosDocumentosVazios);
                      setPaginaDocs(1);
                    }}
                  >
                    {vinculosPermitidos.map((v) => (
                      <option key={v.id} value={v.id}>
                        Matrícula {v.matricula} · Vínculo {v.numero} · {v.tipo}{" "}
                        · {v.situacao} · {v.orgao} · {dataBR(v.inicio)} a{" "}
                        {v.fim ? dataBR(v.fim) : "atual"}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <dl className="v2v-detail-grid pf-fields">
                {Object.entries({
                  CPF: servidor.cpf,
                  Matrícula: vinculo?.matricula ?? "—",
                  "Nº do Vínculo": vinculo?.numero ?? "—",
                  "Tipo de Vínculo": vinculo?.tipo ?? "—",
                  "Situação do Vínculo": vinculo ? (
                    <Tag situacao={vinculo.situacao} />
                  ) : (
                    "—"
                  ),
                  "Órgão/Entidade": vinculo?.orgao ?? "—",
                  "Unidade/Lotação": vinculo?.unidade ?? "—",
                  "Período do vínculo": vinculo
                    ? `${dataBR(vinculo.inicio)} a ${vinculo.fim ? dataBR(vinculo.fim) : "atual"}`
                    : "—",
                }).map(([campo, valor]) => (
                  <div key={campo}>
                    <dt>{campo}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <p className="pf-info">
              <i className="pi pi-info-circle" aria-hidden="true" />
              Todos os documentos exibidos nesta funcionalidade já foram
              validados e permanecem disponíveis para consulta.
            </p>
            <h2>Documentos do Servidor</h2>
            <TabsSeplag
              className="pf-tabs"
              equalWidth
              items={(["Todos", ...CATEGORIAS] as const).map((nome) => ({
                label: `${nome} (${nome === "Todos" ? docsServidor.length : docsServidor.filter((d) => d.categoria === nome).length})`,
                value: nome,
              }))}
              activeValue={aba}
              onChange={(nome) => {
                setAba(nome);
                setPaginaDocs(1);
                setFiltrosDocs(filtrosDocumentosVazios);
              }}
            />
            <section
              className="v2v-panel v2v-filters pf-doc-filters"
              aria-label="Filtros dos documentos"
            >
              <label>
                Buscar documento
                <input
                  placeholder="Digite o nome do documento..."
                  value={filtrosDocs.busca}
                  onChange={(e) => atualizarDocs("busca", e.target.value)}
                />
              </label>
              <label>
                Origem
                <select
                  value={filtrosDocs.origem}
                  onChange={(e) => atualizarDocs("origem", e.target.value)}
                >
                  <option value="">Todas</option>
                  {[...new Set(docsAba.map((d) => d.origem))].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label>
                Anexado por
                <select
                  value={filtrosDocs.autor}
                  onChange={(e) => atualizarDocs("autor", e.target.value)}
                >
                  <option value="">Todos</option>
                  {[...new Set(docsAba.map((d) => d.anexadoPor))].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label>
                Data inicial do anexo
                <input
                  type="date"
                  value={filtrosDocs.inicio}
                  onChange={(e) => atualizarDocs("inicio", e.target.value)}
                />
              </label>
              <label>
                Data final do anexo
                <input
                  type="date"
                  value={filtrosDocs.fim}
                  onChange={(e) => atualizarDocs("fim", e.target.value)}
                />
              </label>
              <div className="v2v-filter-actions">
                <button
                  type="button"
                  className="v2v-primary"
                  onClick={() => {
                    setFiltrosDocs(filtrosDocumentosVazios);
                    setPaginaDocs(1);
                  }}
                >
                  <i className="pi pi-refresh" aria-hidden="true" />
                  Limpar filtros
                </button>
              </div>
            </section>
            {filtrosDocs.inicio &&
              filtrosDocs.fim &&
              filtrosDocs.inicio > filtrosDocs.fim && (
                <p className="v2v-error" role="alert">
                  A data final do anexo deve ser igual ou posterior à data
                  inicial.
                </p>
              )}
            {!docsFiltrados.length ? (
              <p className="v2v-empty">
                Nenhum documento encontrado nesta categoria.
              </p>
            ) : (
              <section
                className="v2v-panel pf-grid"
                aria-label="Documentos da Pasta Funcional"
              >
                <div className="v2v-table-wrap">
                  <table className="v2v-table">
                    <thead>
                      <tr>
                        {[
                          "Documento",
                          "Categoria",
                          "Origem",
                          "Anexado por",
                          "Data/Hora do Anexo",
                          "Arquivo",
                          "Ações",
                        ].map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docsFiltrados
                        .slice(
                          (paginaDocsAtual - 1) * porPaginaDocs,
                          paginaDocsAtual * porPaginaDocs,
                        )
                        .map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.nome}</td>
                            <td>{doc.categoria}</td>
                            <td>{doc.origem}</td>
                            <td>
                              {doc.anexadoPor}
                              <small className="pf-cell-note">
                                {doc.orgaoResponsavel}
                              </small>
                            </td>
                            <td>{dataHora(doc.anexadoEm)}</td>
                            <td className="pf-file-name">
                              {doc.arquivoNome}
                              <small className="pf-cell-note">
                                {doc.arquivoNome
                                  .split(".")
                                  .pop()
                                  ?.toUpperCase()}{" "}
                                {tamanho(doc.arquivoTamanho)}
                              </small>
                            </td>
                            <td>
                              <div className="pf-actions">
                                <button
                                  type="button"
                                  className="v2v-icon-action pf-icon"
                                  title="Visualizar"
                                  aria-label={`Visualizar ${doc.nome}`}
                                  onClick={() => void visualizar(doc)}
                                >
                                  <i className="pi pi-eye" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className="v2v-icon-action pf-icon"
                                  title="Download"
                                  aria-label={`Baixar ${doc.nome}`}
                                  onClick={() => void baixar(doc)}
                                >
                                  <i
                                    className="pi pi-download"
                                    aria-hidden="true"
                                  />
                                </button>
                                <button
                                  type="button"
                                  className="v2v-icon-action pf-icon"
                                  title="Ver detalhes"
                                  aria-label={`Ver detalhes de ${doc.nome}`}
                                  onClick={() => setDetalhe(doc)}
                                >
                                  <i
                                    className="pi pi-info-circle"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <PaginacaoV2
                  nome="documentos da Pasta Funcional"
                  pagina={paginaDocsAtual}
                  totalPaginas={paginasDocs}
                  porPagina={porPaginaDocs}
                  mudarPagina={setPaginaDocs}
                  mudarPorPagina={(q) => {
                    setPorPaginaDocs(q);
                    setPaginaDocs(1);
                  }}
                />
              </section>
            )}
          </>
        )}
        {servidorId && (
          <div className="v2v-form-actions">
            <Link className="v2v-secondary" to={consultaUrl}>
              <i className="pi pi-arrow-left" aria-hidden="true" />
              Voltar
            </Link>
          </div>
        )}
      </div>
      <ModalSeplag
        visible={Boolean(detalhe)}
        titulo="Detalhes do documento"
        tamanho="900px"
        fechar={() => setDetalhe(null)}
        hideFooter
      >
        <div className="v2v-page pf-modal-content">
          <dl className="v2v-detail-grid pf-fields">
            {Object.entries(dadosDetalhe).map(([campo, valor]) => (
              <div key={campo}>
                <dt>{campo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
          <div className="v2v-form-actions">
            <button
              type="button"
              className="v2v-secondary"
              onClick={() => setDetalhe(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      </ModalSeplag>
      <ModalSeplag
        visible={Boolean(visualizacao)}
        titulo={visualizacao?.doc.nome ?? "Visualizar documento"}
        tamanho="1000px"
        fechar={() => setVisualizacao(null)}
        hideFooter
      >
        <div className="v2v-page pf-modal-content">
          {visualizacao?.texto !== undefined ? (
            <pre className="pf-text-preview">{visualizacao.texto}</pre>
          ) : visualizacao?.tipo.startsWith("image/") ? (
            <img
              className="pf-image-preview"
              src={visualizacao.url}
              alt={visualizacao.doc.nome}
            />
          ) : visualizacao?.tipo === "application/pdf" ? (
            <iframe
              className="pf-pdf-preview"
              title={visualizacao.doc.nome}
              src={visualizacao.url}
            />
          ) : (
            <p>
              O formato deste arquivo não possui visualização no navegador.
              Utilize Download para abrir no aplicativo correspondente.
            </p>
          )}
          <div className="v2v-form-actions">
            <button
              type="button"
              className="v2v-secondary"
              onClick={() => setVisualizacao(null)}
            >
              Fechar
            </button>
            {visualizacao && (
              <button
                type="button"
                className="v2v-primary"
                onClick={() => void baixar(visualizacao.doc)}
              >
                <i className="pi pi-download" aria-hidden="true" />
                Download
              </button>
            )}
          </div>
        </div>
      </ModalSeplag>
      <ModalSeplag
        visible={anexarAberto}
        titulo="Anexar documento"
        tamanho="760px"
        fechar={() => {
          if (!salvando) setAnexarAberto(false);
        }}
        closeOnEscape={!salvando}
        hideFooter
      >
        <form
          className="v2v-page pf-modal-content"
          onSubmit={(e) => void salvarAnexo(e)}
        >
          <div className="v2v-form-grid pf-upload-grid">
            <label>
              Categoria <em>*</em>
              <select
                required
                value={categoria}
                onChange={(e) => {
                  const c = e.target.value as Exclude<Categoria, "Ingresso">;
                  setCategoria(c);
                  setTipoDocumento(TIPOS_DOCUMENTO[c][0]);
                }}
              >
                {CATEGORIAS.filter((c) => c !== "Ingresso").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Tipo de Documento <em>*</em>
              <select
                required
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
              >
                {TIPOS_DOCUMENTO[categoria].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Data do Documento
              <input
                type="date"
                value={dataDocumento}
                onChange={(e) => setDataDocumento(e.target.value)}
              />
            </label>
            {categoria !== "Cadastrais" && (
              <label>
                Vínculo relacionado
                {categoria !== "Documentos Gerais" && <em>*</em>}
                <select
                  required={categoria !== "Documentos Gerais"}
                  value={relacionado}
                  onChange={(e) => setRelacionado(e.target.value)}
                >
                  <option value="">Pessoa Física / todos os vínculos</option>
                  {vinculosPermitidos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.matricula} · Vínculo {v.numero} · {v.tipo}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="pf-full">
              Arquivo <em>*</em>
              <input
                key={chaveUpload}
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
              <small>PDF, PNG, JPG, TXT, DOC ou DOCX. Máximo: 10 MB.</small>
            </label>
            <label className="pf-full">
              Observação
              <textarea
                value={observacao}
                maxLength={1000}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </label>
          </div>
          <p className="pf-info">
            O documento será incluído na Pasta Funcional do Servidor e ficará
            disponível para consulta.
          </p>
          {erroAnexo && (
            <p className="v2v-error" role="alert">
              {erroAnexo}
            </p>
          )}
          <div className="v2v-form-actions">
            <button
              type="button"
              className="v2v-secondary"
              disabled={salvando}
              onClick={() => setAnexarAberto(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="v2v-primary" disabled={salvando}>
              {salvando ? "Anexando..." : "Anexar documento"}
            </button>
          </div>
        </form>
      </ModalSeplag>
    </CardSeplag>
  );
}
