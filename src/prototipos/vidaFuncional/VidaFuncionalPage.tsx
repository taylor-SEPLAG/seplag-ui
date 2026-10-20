import {
  Fragment,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { CardSeplag } from "../../componentes/Card";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import {
  pessoas,
  vinculos,
  eventos,
  dataBR,
  situacao,
  pesquisarPessoas,
  pesquisarEventos,
  indicadores,
  filtrosVazios,
  atualizarVinculosCadastrados,
  type Evento,
  type Filtros,
} from "./model";
import "../vinculos/vinculoV2.css";
import "./vidaFuncional.css";

const base = "/prototipos/sigep/vida-funcional";
const OPCOES_POR_PAGINA = [10, 20, 50];

const ESTILOS_OCORRENCIA: Record<
  string,
  { cor: string; fundo: string; icone: string }
> = {
  Ingresso: { cor: "#1976D2", fundo: "#E3F2FD", icone: "pi-sign-in" },
  Movimentação: {
    cor: "#00838F",
    fundo: "#E0F7FA",
    icone: "pi-arrow-right-arrow-left",
  },
  Férias: { cor: "#B77900", fundo: "#FFF8E1", icone: "pi-calendar" },
  "Recesso remunerado": { cor: "#B77900", fundo: "#FFF8E1", icone: "pi-calendar" },
  "Prorrogação de contrato": { cor: "#1976D2", fundo: "#E3F2FD", icone: "pi-file-edit" },
  "Alteração de supervisão": { cor: "#00838F", fundo: "#E0F7FA", icone: "pi-users" },
  Licença: { cor: "#EF6C00", fundo: "#FFF3E0", icone: "pi-file" },
  "Retorno ao exercício": {
    cor: "#2E7D32",
    fundo: "#E8F5E9",
    icone: "pi-replay",
  },
  "Progressão funcional": {
    cor: "#7B1FA2",
    fundo: "#F3E5F5",
    icone: "pi-arrow-up",
  },
  "Alteração de jornada": {
    cor: "#3949AB",
    fundo: "#E8EAF6",
    icone: "pi-clock",
  },
  "Alteração de cargo/função": {
    cor: "#5E35B1",
    fundo: "#EDE7F6",
    icone: "pi-id-card",
  },
  Encerramento: { cor: "#C62828", fundo: "#FFEBEE", icone: "pi-times-circle" },
};

function estiloOcorrencia(tipo: string) {
  // Subtipos podem reaproveitar a paleta da categoria funcional.
  const categoria = Object.keys(ESTILOS_OCORRENCIA).find((nome) =>
    tipo.toLocaleLowerCase("pt-BR").startsWith(nome.toLocaleLowerCase("pt-BR")),
  );
  return categoria
    ? ESTILOS_OCORRENCIA[categoria]
    : { cor: "#596B7E", fundo: "#EBEFF3", icone: "pi-file" };
}

function Campos({ dados }: { dados: Record<string, string> }) {
  return (
    <dl className="vf-campos v2v-detail-grid">
      {Object.entries(dados).map(([campo, valor]) => (
        <div key={campo}>
          <dt>{campo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tag({ valor }: { valor: string }) {
  const classe =
    valor === "Vigente" || valor === "Ativo"
      ? "ativo"
      : valor === "Encerrado" || valor === "Extinto"
        ? "encerrado"
        : "inativo";
  return <span className={`v2v-status v2v-status-${classe}`}>{valor}</span>;
}

function download(
  nome: string,
  conteudo: string,
  tipo = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", conteudo], { type: tipo }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function detalhes(e: Evento) {
  const secoes = Object.fromEntries(
    Object.entries(e.secoes)
      .map(([titulo, campos]) => [titulo, Object.fromEntries(
        Object.entries(campos).filter(([campo]) => !/^documento(?:\b|\/)/i.test(campo)),
      )] as const)
      .filter(([, campos]) => Object.keys(campos).length > 0),
  );
  return {
    ...secoes,
    "Registro da ocorrência": {
      "Data/hora do registro": `${dataBR(e.registradoEm)} ${e.registradoEm.slice(11, 19)}`,
    },
  };
}

function Paginacao({
  total,
  pagina,
  porPagina,
  mudar,
  mudarPorPagina,
  nome,
}: {
  total: number;
  pagina: number;
  porPagina: number;
  mudar: (p: number) => void;
  mudarPorPagina: (quantidade: number) => void;
  nome: string;
}) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  return (
    <nav className="v2v-pagination" aria-label={`Paginação de ${nome}`}>
      <button
        type="button"
        aria-label={`Primeira página de ${nome}`}
        disabled={pagina === 0}
        onClick={() => mudar(0)}
      >
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Página anterior de ${nome}`}
        disabled={pagina === 0}
        onClick={() => mudar(pagina - 1)}
      >
        <i className="pi pi-angle-left" aria-hidden="true" />
      </button>
      {Array.from({ length: paginas }, (_, indice) => indice).map((numero) => (
        <button
          type="button"
          key={numero}
          className={numero === pagina ? "is-current" : ""}
          aria-label={`Página ${numero + 1} de ${nome}`}
          aria-current={numero === pagina ? "page" : undefined}
          onClick={() => mudar(numero)}
        >
          {numero + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label={`Próxima página de ${nome}`}
        disabled={pagina + 1 >= paginas}
        onClick={() => mudar(pagina + 1)}
      >
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Última página de ${nome}`}
        disabled={pagina + 1 >= paginas}
        onClick={() => mudar(paginas - 1)}
      >
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <select
        aria-label={`Registros por página de ${nome}`}
        value={porPagina}
        onChange={(evento) => mudarPorPagina(Number(evento.target.value))}
      >
        {OPCOES_POR_PAGINA.map((quantidade) => (
          <option key={quantidade} value={quantidade}>
            {quantidade}
          </option>
        ))}
      </select>
    </nav>
  );
}

export function VidaFuncionalPage() {
  atualizarVinculosCadastrados();
  const { pessoaId, vinculoId } = useParams();
  const [routeParams] = useSearchParams();
  if (pessoaId && !vinculoId) {
    const destino = new URLSearchParams(routeParams);
    const expandidos = new Set(
      (destino.get("expand") || "").split(",").filter(Boolean),
    );
    expandidos.add(pessoaId);
    destino.set("expand", [...expandidos].join(","));
    return <Navigate replace to={`${base}?${destino}`} />;
  }
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="prototype-page-content prototype-page-content--white v2v-shell">
        <Conteudo
          key={`${pessoaId ?? ""}/${vinculoId ?? ""}`}
          pessoaId={pessoaId}
          vinculoId={vinculoId}
        />
      </main>
    </PrototypeSystemPage>
  );
}

function Conteudo({
  pessoaId,
  vinculoId,
}: {
  pessoaId?: string;
  vinculoId?: string;
}) {
  const [params, setParams] = useSearchParams();
  const filtros = {
    ...filtrosVazios,
    ...Object.fromEntries(
      Object.keys(filtrosVazios).map((chave) => [
        chave,
        params.get(chave) || "",
      ]),
    ),
  } as Filtros;
  const [rascunho, setRascunho] = useState(filtros);
  const pagina = Math.max(0, Number(params.get("pagina")) || 0);
  const porPaginaInformado = Number(params.get("porPagina"));
  const porPagina = OPCOES_POR_PAGINA.includes(porPaginaInformado)
    ? porPaginaInformado
    : OPCOES_POR_PAGINA[0];
  const [expandidos, setExpandidos] = useState<string[]>(() =>
    (params.get("expand") || "").split(",").filter(Boolean),
  );
  const [tipo, setTipo] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [antigo, setAntigo] = useState(false);
  const [paginaHistorico, setPaginaHistorico] = useState(0);
  const [porPaginaHistorico, setPorPaginaHistorico] = useState(
    OPCOES_POR_PAGINA[0],
  );
  const [abertos, setAbertos] = useState<string[]>([]);
  const pessoa = pessoas.find((item) => item.id === pessoaId);
  const meusVinculos = vinculos.filter((item) => item.pessoaId === pessoaId);
  const vinculo = meusVinculos.find((item) => item.id === vinculoId);
  const servidores = pesquisarPessoas(filtros);
  const paginaAtual = Math.min(
    pagina,
    Math.max(0, Math.ceil(servidores.length / porPagina) - 1),
  );
  const invalido = Boolean(inicio && fim && inicio > fim);
  const historico = vinculo
    ? pesquisarEventos(vinculo.id, tipo, inicio, fim, antigo)
    : [];
  const paginaHistoricoAtual = Math.min(
    paginaHistorico,
    Math.max(0, Math.ceil(historico.length / porPaginaHistorico) - 1),
  );
  const titulo = vinculoId
    ? "Histórico da Vida Funcional"
    : "Histórico Funcional";
  const consultaUrl = `${base}${params.toString() ? `?${params}` : ""}`;
  const historicoUrl = (id: string, servidorId = pessoaId) =>
    `${base}/${servidorId}/vinculos/${id}/historico${params.toString() ? `?${params}` : ""}`;
  const resumo: Record<string, string> =
    pessoa && vinculo
      ? {
          "Nome do servidor": pessoa.nome,
          CPF: pessoa.cpf,
          Matrícula: vinculo.matricula,
          "Número do vínculo": String(vinculo.numero),
          "Tipo de vínculo": vinculo.tipo,
          "Cargo/Função": vinculo.cargo,
          "Órgão/Entidade": vinculo.orgao,
          Unidade: vinculo.unidade,
          Classificação: vinculo.classificacao,
          Situação: situacao(vinculo),
          "Data de início": dataBR(vinculo.inicio),
          "Data de encerramento": dataBR(vinculo.fim),
        }
      : {};
  const exportar = () => {
    if (!vinculo || !pessoa) return;
    const todos = pesquisarEventos(vinculo.id);
    download(
      `vida-funcional-${vinculo.matricula}-${vinculo.numero}.txt`,
      [
        "SIGEP — Histórico da Vida Funcional",
        ...Object.entries(resumo).map(([chave, valor]) => `${chave}: ${valor}`),
        ...todos.map(
          (evento) =>
            `\n${dataBR(evento.data)} — ${evento.tipo}\n${evento.titulo}\n${Object.entries(
              detalhes(evento),
            )
              .map(
                ([secao, campos]) =>
                  `${secao}\n${Object.entries(campos)
                    .map(([chave, valor]) => `${chave}: ${valor}`)
                    .join("\n")}`,
              )
              .join("\n")}`,
        ),
      ].join("\n"),
    );
  };
  const atualizarFiltro = (
    campo: keyof Pick<Filtros, "busca" | "tipo" | "situacao">,
    valor: string,
  ) => {
    const novos = { ...rascunho, [campo]: valor };
    setRascunho(novos);
    const novaConsulta = new URLSearchParams(params);
    if (valor) novaConsulta.set(campo, valor);
    else novaConsulta.delete(campo);
    novaConsulta.delete("pagina");
    setParams(novaConsulta, { replace: true });
  };
  const limparFiltros = () => {
    setRascunho(filtrosVazios);
    const novaConsulta = new URLSearchParams();
    if (expandidos.length) novaConsulta.set("expand", expandidos.join(","));
    if (porPagina !== OPCOES_POR_PAGINA[0]) {
      novaConsulta.set("porPagina", String(porPagina));
    }
    setParams(novaConsulta, { replace: true });
  };
  const alternarServidor = (id: string) => {
    const novos = expandidos.includes(id)
      ? expandidos.filter((item) => item !== id)
      : [...expandidos, id];
    setExpandidos(novos);
    const novaConsulta = new URLSearchParams(params);
    if (novos.length) novaConsulta.set("expand", novos.join(","));
    else novaConsulta.delete("expand");
    setParams(novaConsulta, { replace: true });
  };
  const vinculosVisiveis = (servidorId: string) => {
    const busca = filtros.busca.trim();
    const servidor = pessoas.find((item) => item.id === servidorId);
    const termo = busca
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const digitos = busca.replace(/\D/g, "");
    const correspondePessoa =
      !busca ||
      Boolean(
        servidor &&
        (servidor.nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(termo) ||
          (digitos.length > 0 &&
            servidor.cpf.replace(/\D/g, "").includes(digitos))),
      );
    return vinculos.filter(
      (item) =>
        item.pessoaId === servidorId &&
        (!filtros.tipo || item.tipo === filtros.tipo) &&
        (!filtros.situacao || situacao(item) === filtros.situacao) &&
        (correspondePessoa || item.matricula.includes(busca)),
    );
  };
  const guardarRolagem = () => {
    if (window.scrollY > 0)
      sessionStorage.setItem("vida-funcional-scroll", String(window.scrollY));
  };
  useEffect(() => {
    if (pessoaId) return;
    const posicao = sessionStorage.getItem("vida-funcional-scroll");
    if (!posicao) return;
    sessionStorage.removeItem("vida-funcional-scroll");
    requestAnimationFrame(() =>
      window.scrollTo({ top: Number(posicao), behavior: "auto" }),
    );
  }, [pessoaId]);
  const cabecalho = (
    <BreadcrumbSeplag
      divided
      homeTo="/prototipos/sigep"
      items={[
        {
          label: "Vínculos Funcionais",
          to: "/prototipos/sigep/vinculos-funcionais",
        },
        { label: "Histórico Funcional", to: consultaUrl },
        ...(vinculoId ? [{ label: "Histórico da Vida Funcional" }] : []),
      ]}
    />
  );

  let conteudo: ReactNode;
  if (pessoaId && (!pessoa || (vinculoId && !vinculo))) {
    conteudo = (
      <div role="alert" className="v2v-panel">
        <p>Servidor ou vínculo não encontrado.</p>
        <Link to={consultaUrl}>Voltar à consulta</Link>
      </div>
    );
  } else if (!pessoaId) {
    const valores = indicadores();
    conteudo = (
      <>
        <p className="v2v-description">
          Consulte os vínculos e o histórico funcional dos servidores.
        </p>
        <section
          className="v2v-kpis vf-kpis"
          aria-label="Indicadores da vida funcional"
        >
          <article className="vf-kpi-general">
            <i className="pi pi-users" aria-hidden="true" />
            <div>
              <span>Total de servidores</span>
              <strong>{valores[0]}</strong>
            </div>
          </article>
          <article className="v2v-kpi-active">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <div>
              <span>Vínculos ativos</span>
              <strong>{valores[1]}</strong>
            </div>
          </article>
          <article className="v2v-kpi-closed">
            <i className="pi pi-times-circle" aria-hidden="true" />
            <div>
              <span>Vínculos encerrados</span>
              <strong>{valores[2]}</strong>
            </div>
          </article>
          <article className="v2v-kpi-inactive">
            <i className="pi pi-calendar" aria-hidden="true" />
            <div>
              <span>Movimentações no mês</span>
              <strong>{valores[3]}</strong>
            </div>
          </article>
        </section>
        <section
          className="v2v-panel v2v-filters vf-consulta-filtros"
          aria-label="Filtros de consulta"
        >
          <label>
            Servidor / CPF / Matrícula
            <input
              value={rascunho.busca}
              onChange={(evento) =>
                atualizarFiltro("busca", evento.target.value)
              }
              placeholder="Buscar servidor, CPF ou matrícula"
            />
          </label>
          <label>
            Tipo de Vínculo
            <select
              value={rascunho.tipo}
              onChange={(evento) =>
                atualizarFiltro("tipo", evento.target.value)
              }
            >
              <option value="">Todos</option>
              {[...new Set(vinculos.map((item) => item.tipo))].map((opcao) => (
                <option key={opcao}>{opcao}</option>
              ))}
            </select>
          </label>
          <label>
            Situação do Vínculo
            <select
              value={rascunho.situacao}
              onChange={(evento) =>
                atualizarFiltro("situacao", evento.target.value)
              }
            >
              <option value="">Todas</option>
              <option>Ativo</option>
              <option>Encerrado</option>
            </select>
          </label>
          <div className="v2v-filter-actions">
            <button
              className="v2v-primary"
              type="button"
              onClick={limparFiltros}
            >
              <i className="pi pi-refresh" aria-hidden="true" />
              Limpar filtro
            </button>
          </div>
        </section>
        <section
          className="v2v-panel vf-grid-panel"
          aria-label="Consulta de servidores"
        >
          <div className="v2v-table-wrap">
            <table className="v2v-table">
              <thead>
                <tr>
                  {["Servidor", "CPF", "Quantidade de Vínculos", "Ação"].map(
                    (coluna) => (
                      <th key={coluna}>{coluna}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {servidores
                  .slice(
                    paginaAtual * porPagina,
                    paginaAtual * porPagina + porPagina,
                  )
                  .map((item) => {
                    const lista = vinculos.filter(
                      (registro) => registro.pessoaId === item.id,
                    );
                    const listaFiltrada = vinculosVisiveis(item.id);
                    const expandido = expandidos.includes(item.id);
                    return (
                      <Fragment key={item.id}>
                        <tr
                          className="vf-server-row"
                          tabIndex={0}
                          aria-expanded={expandido}
                          onClick={() => alternarServidor(item.id)}
                          onKeyDown={(evento) => {
                            if (evento.key === "Enter" || evento.key === " ") {
                              evento.preventDefault();
                              alternarServidor(item.id);
                            }
                          }}
                        >
                          <td>{item.nome}</td>
                          <td>{item.cpf}</td>
                          <td>{lista.length}</td>
                          <td>
                            <button
                              type="button"
                              className="v2v-icon-action"
                              aria-label={
                                expandido
                                  ? "Recolher vínculos"
                                  : "Expandir vínculos"
                              }
                              title={
                                expandido
                                  ? "Recolher vínculos"
                                  : "Expandir vínculos"
                              }
                              aria-expanded={expandido}
                              onClick={(evento) => {
                                evento.stopPropagation();
                                alternarServidor(item.id);
                              }}
                            >
                              <i
                                className={`pi pi-chevron-${expandido ? "up" : "down"}`}
                                aria-hidden="true"
                              />
                            </button>
                          </td>
                        </tr>
                        {expandido && (
                          <tr className="v2v-expanded-row">
                            <td colSpan={4}>
                              <div className="v2v-expanded vf-expanded">
                                <div className="v2v-expanded-head">
                                  <div>
                                    <strong>Vínculos do Servidor</strong>
                                    <span>
                                      {listaFiltrada.length} vínculo(s)
                                      encontrado(s)
                                    </span>
                                  </div>
                                </div>
                                <div className="v2v-table-wrap">
                                  <table className="v2v-table v2v-inner-table">
                                    <thead>
                                      <tr>
                                        {[
                                          "Matrícula",
                                          "Nº do Vínculo",
                                          "Tipo de Vínculo",
                                          "Cargo/Função",
                                          "Órgão/Entidade",
                                          "Data de Início",
                                          "Data de Encerramento",
                                          "Situação",
                                          "Ação",
                                        ].map((coluna) => (
                                          <th key={coluna}>{coluna}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {listaFiltrada.map((registro) => (
                                        <tr key={registro.id}>
                                          <td>{registro.matricula}</td>
                                          <td>{registro.numero}</td>
                                          <td>{registro.tipo}</td>
                                          <td>{registro.cargo}</td>
                                          <td>{registro.orgao}</td>
                                          <td>{dataBR(registro.inicio)}</td>
                                          <td>{dataBR(registro.fim)}</td>
                                          <td>
                                            <Tag valor={situacao(registro)} />
                                          </td>
                                          <td>
                                            <Link
                                              className="v2v-icon-action vf-action"
                                              aria-label="Ver Histórico da Vida Funcional"
                                              title="Ver Histórico da Vida Funcional"
                                              to={historicoUrl(
                                                registro.id,
                                                item.id,
                                              )}
                                              onClick={guardarRolagem}
                                            >
                                              <i
                                                className="pi pi-history"
                                                aria-hidden="true"
                                              />
                                            </Link>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                {!servidores.length && (
                  <tr>
                    <td colSpan={4} className="v2v-empty">
                      Nenhum servidor encontrado para os filtros informados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao
            total={servidores.length}
            pagina={paginaAtual}
            porPagina={porPagina}
            nome="servidores"
            mudar={(novaPagina) => {
              const novos = new URLSearchParams(params);
              if (novaPagina) novos.set("pagina", String(novaPagina));
              else novos.delete("pagina");
              setParams(novos);
            }}
            mudarPorPagina={(quantidade) => {
              const novos = new URLSearchParams(params);
              novos.delete("pagina");
              if (quantidade === OPCOES_POR_PAGINA[0]) {
                novos.delete("porPagina");
              } else {
                novos.set("porPagina", String(quantidade));
              }
              setParams(novos);
            }}
          />
        </section>
      </>
    );
  } else {
    conteudo = (
      <>
        <section
          className="v2v-panel vf-resumo"
          aria-labelledby="resumo-vinculo"
        >
          <h2 id="resumo-vinculo">Resumo do Vínculo</h2>
          <Campos dados={resumo} />
          {vinculo?.relacionadoId && (
            <Link
              className="vf-related-link"
              to={historicoUrl(vinculo.relacionadoId)}
            >
              <i className="pi pi-link" aria-hidden="true" />
              Consultar vínculo{" "}
              {vinculo.tipo === "Aposentado"
                ? "efetivo de origem"
                : "de aposentado gerado"}
            </Link>
          )}
        </section>
        <section
          className="vf-timeline-section"
          aria-labelledby="titulo-linha-tempo"
        >
          <h2 id="titulo-linha-tempo">Linha do Tempo Funcional</h2>
          <div
            className="v2v-panel v2v-filters vf-history-filters"
            aria-label="Filtros do histórico"
          >
            <label>
              Tipo de Ocorrência
              <select
                value={tipo}
                onChange={(evento) => {
                  setTipo(evento.target.value);
                  setPaginaHistorico(0);
                }}
              >
                <option value="">Todos</option>
                {[
                  ...new Set(
                    eventos
                      .filter((evento) => evento.vinculoId === vinculoId)
                      .map((evento) => evento.tipo),
                  ),
                ].map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
            </label>
            <label>
              Data Inicial
              <input
                type="date"
                value={inicio}
                onChange={(evento) => {
                  setInicio(evento.target.value);
                  setPaginaHistorico(0);
                }}
              />
            </label>
            <label>
              Data Final
              <input
                type="date"
                value={fim}
                onChange={(evento) => {
                  setFim(evento.target.value);
                  setPaginaHistorico(0);
                }}
              />
            </label>
            <label>
              Ordenação
              <select
                value={antigo ? "antigo" : "recente"}
                onChange={(evento) => {
                  setAntigo(evento.target.value === "antigo");
                  setPaginaHistorico(0);
                }}
              >
                <option value="recente">Mais recentes primeiro</option>
                <option value="antigo">Mais antigos primeiro</option>
              </select>
            </label>
            <div className="v2v-filter-actions">
              <button
                className="v2v-primary"
                type="button"
                onClick={() => {
                  setTipo("");
                  setInicio("");
                  setFim("");
                  setAntigo(false);
                  setPaginaHistorico(0);
                }}
              >
                <i className="pi pi-refresh" aria-hidden="true" />
                Limpar filtro
              </button>
              <button className="v2v-primary" type="button" onClick={exportar}>
                <i className="pi pi-download" aria-hidden="true" />
                Exportar Histórico
              </button>
            </div>
          </div>
          {invalido ? (
            <p role="alert" className="v2v-error">
              A data final deve ser igual ou posterior à data inicial.
            </p>
          ) : (
            <>
              <p className="vf-contagem">{historico.length} ocorrência(s)</p>
              <div className="vf-timeline">
                {historico
                  .slice(
                    paginaHistoricoAtual * porPaginaHistorico,
                    (paginaHistoricoAtual + 1) * porPaginaHistorico,
                  )
                  .map((evento) => {
                    const aberto = abertos.includes(evento.id);
                    const visual = estiloOcorrencia(evento.tipo);
                    return (
                      <article
                        className={`vf-evento${aberto ? " is-expanded" : ""}`}
                        key={evento.id}
                        style={
                          {
                            "--vf-evento-cor": visual.cor,
                            "--vf-evento-fundo": visual.fundo,
                          } as CSSProperties
                        }
                      >
                        <button
                          type="button"
                          className="vf-evento-linha"
                          aria-expanded={aberto}
                          aria-controls={`detalhe-${evento.id}`}
                          onClick={() =>
                            setAbertos((atuais) =>
                              aberto
                                ? atuais.filter((id) => id !== evento.id)
                                : [...atuais, evento.id],
                            )
                          }
                        >
                          <time dateTime={evento.data}>
                            {dataBR(evento.data)}
                          </time>
                          <span className="v2v-status vf-evento-tag">
                            <i
                              className={`pi ${visual.icone}`}
                              aria-hidden="true"
                            />
                            {evento.tipo}
                          </span>
                          <span className="vf-evento-texto">
                            <strong>{evento.titulo}</strong>
                            <small>{evento.descricao}</small>
                          </span>
                          <i
                            className={`pi pi-chevron-${aberto ? "up" : "down"}`}
                            aria-hidden="true"
                          />
                        </button>
                        {aberto && (
                          <div
                            id={`detalhe-${evento.id}`}
                            className="vf-detalhes"
                          >
                            {Object.entries(detalhes(evento)).map(
                              ([secao, campos]) => (
                                <section key={secao}>
                                  <h3>{secao}</h3>
                                  <Campos dados={campos} />
                                </section>
                              ),
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
              </div>
              {!historico.length && (
                <p className="v2v-empty">
                  Nenhuma ocorrência encontrada para os filtros informados.
                </p>
              )}
              <Paginacao
                total={historico.length}
                pagina={paginaHistoricoAtual}
                porPagina={porPaginaHistorico}
                nome="histórico"
                mudar={setPaginaHistorico}
                mudarPorPagina={(quantidade) => {
                  setPorPaginaHistorico(quantidade);
                  setPaginaHistorico(0);
                }}
              />
            </>
          )}
        </section>
        <div className="v2v-form-actions">
          <Link className="v2v-secondary" to={consultaUrl}>
            <i className="pi pi-arrow-left" aria-hidden="true" />
            Voltar
          </Link>
        </div>
      </>
    );
  }

  return (
    <CardSeplag
      title={titulo}
      cols="12"
      cardHeaderClassNames="prototype-carreira-card v2v-card"
      headerNavigation={cabecalho}
    >
      <div className="v2v-page vf-page">{conteudo}</div>
    </CardSeplag>
  );
}
