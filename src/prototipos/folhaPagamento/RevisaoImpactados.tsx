import { useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  BotaoSeplag,
  BotaoVoltarSeplag,
} from "../../componentes/Botao";
import type { CatalogoAbrangencia } from "./abrangenciaGrupoCalculo";
import {
  calcularRevisaoImpactos,
  criarContextoImpactos,
  resultadoDaRevisao,
  validarGrupoRevisado,
  camposImpacto,
  type CampoImpacto,
  type DecisoesImpacto,
  type GrupoImpacto,
  type OrdensImpacto,
  type ResultadoRevisao,
  type RubricaImpacto,
} from "./revisaoImpactosModelo";
import "./revisaoImpactados.css";
export type { ResultadoRevisao } from "./revisaoImpactosModelo";

type Props = {
  pai: GrupoImpacto;
  grupos: GrupoImpacto[];
  criteriosPai: NonNullable<GrupoImpacto["abrangencia"]>;
  catalogo: CatalogoAbrangencia;
  atuais: RubricaImpacto[];
  novas: RubricaImpacto[];
  catalogoRubricas?: RubricaImpacto[];
  versaoPai: number;
  inicio: string;
  usuario: string;
  onCancel: () => void;
  onConfirm: (resultado: ResultadoRevisao) => void;
};

export function RevisaoImpactados({
  pai,
  grupos,
  criteriosPai,
  catalogo,
  atuais,
  novas,
  catalogoRubricas = [],
  versaoPai,
  inicio,
  usuario,
  onCancel,
  onConfirm,
}: Props) {
  const [contexto] = useState(() =>
    criarContextoImpactos(
      pai,
      grupos,
      criteriosPai,
      atuais,
      novas,
      catalogo,
      catalogoRubricas,
    ),
  );
  const [selecionado, selecionar] = useState(contexto.arvore[0]?.id);
  const [aba, setAba] = useState<"abrangencia" | "rubricas">("abrangencia");
  const [decisoes, setDecisoes] = useState<DecisoesImpacto>({});
  const [ordens, setOrdens] = useState<OrdensImpacto>({});
  const [revisados, setRevisados] = useState<Record<number, string>>({});
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);
  const [cancelamento, setCancelamento] = useState(false);
  const revisoes = calcularRevisaoImpactos(contexto, decisoes, ordens);
  const revisada = (id: number) =>
    revisoes[id].alteracoes === 0 ||
    (revisoes[id].pendencias === 0 &&
      revisados[id] === revisoes[id].assinatura);
  const pendentes = contexto.arvore.filter((g) => !revisada(g.id)).length;
  const totalAbrangencia = Object.values(revisoes).reduce(
    (n, r) => n + r.abrangencia.length,
    0,
  );
  const totalRubricas = Object.values(revisoes).reduce(
    (n, r) => n + r.alteracoesRubricas,
    0,
  );
  const r = revisoes[selecionado];
  const sujo =
    Object.keys(decisoes).length > 0 ||
    Object.keys(ordens).length > 0 ||
    Object.keys(revisados).length > 0;
  const cancelar = () => (sujo ? setCancelamento(true) : onCancel());
  const rotulo = (campo: CampoImpacto, valores: string[]) =>
    valores.length
      ? valores
          .map((v) => catalogo[campo].find((o) => o.value === v)?.label ?? v)
          .join(", ")
      : "Todas / sem restrição";
  const decidir = (chave: string, valor: DecisoesImpacto[string]) => {
    const proximas = { ...decisoes, [chave]: valor };
    const recalculadas = calcularRevisaoImpactos(contexto, proximas, ordens);
    if (
      chave.includes(":abrangencia:") &&
      recalculadas[selecionado].pendencias === 0
    ) {
      const erros = validarGrupoRevisado(contexto, recalculadas, selecionado);
      if (erros.length) {
        setErro(erros.join(" "));
        return;
      }
    }
    setDecisoes(proximas);
    setErro("");
  };
  const revisar = () => {
    const erros = validarGrupoRevisado(contexto, revisoes, selecionado);
    if (erros.length) {
      setErro(erros.join(" "));
      return;
    }
    setRevisados({ ...revisados, [selecionado]: r.assinatura });
    setErro("");
    const indice = contexto.arvore.findIndex((g) => g.id === selecionado);
    const proximo = [
      ...contexto.arvore.slice(indice + 1),
      ...contexto.arvore.slice(0, indice),
    ].find((g) => !revisada(g.id));
    if (proximo) mudarGrupo(proximo.id);
  };
  const mover = (de: number, para: number) => {
    if (
      !r ||
      de === para ||
      para < 0 ||
      para >= r.rubricas.length ||
      !r.rubricas[de]?.incluida ||
      !r.rubricas[para]?.incluida
    )
      return;
    const codigos = r.rubricas.map((l) => l.codigo);
    const [codigo] = codigos.splice(de, 1);
    codigos.splice(para, 0, codigo);
    setOrdens({ ...ordens, [selecionado]: { origem: r.origemOrdem, codigos } });
    setErro("");
  };
  const validarConjunto = () => {
    if (pendentes) return false;
    const erros = contexto.niveis.flatMap((g) =>
      validarGrupoRevisado(contexto, revisoes, g.id).map(
        (e) => `${g.grupo}: ${e}`,
      ),
    );
    if (erros.length) {
      setErro(erros.join(" "));
      return false;
    }
    return true;
  };
  const confirmar = () => {
    if (!validarConjunto()) {
      setConfirmacao(false);
      return;
    }
    try {
      onConfirm(
        resultadoDaRevisao(
          contexto,
          revisoes,
          decisoes,
          versaoPai,
          inicio,
          usuario,
        ),
      );
    } catch {
      setConfirmacao(false);
      setErro("Não foi possível salvar a revisão. Tente novamente.");
    }
  };
  const tag = (id: number) => (
    <span className={`ri-tag ${revisada(id) ? "revisado" : "pendente"}`}>
      {revisada(id) ? "Revisado" : "Pendente"}
    </span>
  );
  const mudarGrupo = (id: number) => {
    selecionar(id);
    setErro("");
    setArrastando(null);
  };
  return (
    <>
      <Dialog
        visible
        modal
        onHide={cancelar}
        closeIcon={<i className="pi pi-times" aria-hidden="true" />}
        className="ri-modal"
        style={{ width: "min(1600px, 98vw)", height: "94vh" }}
        header={
          <div className="ri-titulo">
            <i className="pi pi-sitemap" aria-hidden="true" />
            <div>
              <strong>Revisão de Registros Impactados</strong>
              <p>
                Revise as alterações realizadas na nova versão do grupo pai e
                defina quais alterações de abrangência e rubricas serão
                aplicadas aos grupos filhos e demais descendentes.
              </p>
            </div>
          </div>
        }
        footer={
          <div className="ri-rodape">
            <BotaoVoltarSeplag
              className="ri-botao-secundario"
              style={{ minWidth: "auto" }}
              label="Voltar à edição do Grupo Pai"
              onClick={cancelar}
            />
            <div className="ri-resumo" aria-live="polite">
              <span>{contexto.arvore.length} grupos impactados</span>
              <span className="ri-separador">|</span>
              <span>{contexto.arvore.length - pendentes} revisados</span>
              <span className="ri-separador">|</span>
              <span className="ri-laranja">{pendentes} pendentes</span>
            </div>
            <BotaoSeplag
              type="button"
              className="ri-botao-sigep"
              label="Concluir revisão"
              icon="pi pi-check"
              disabled={pendentes > 0 || !r}
              onClick={() => {
                if (validarConjunto()) setConfirmacao(true);
              }}
            />
          </div>
        }
      >
        <div className="ri-corpo">
          <aside aria-label="Grupos impactados">
            <h4>
              Grupos impactados <span>{contexto.arvore.length}</span>
            </h4>
            {contexto.arvore.map((g) => (
              <div
                key={g.id}
                className={g.nivel > pai.nivel + 1 ? "ri-descendente" : ""}
                style={{
                  marginLeft: Math.max(0, g.nivel - pai.nivel - 1) * 16,
                }}
              >
                <button
                  type="button"
                  className={`ri-grupo ${g.id === selecionado ? "ativo" : ""}`}
                  aria-pressed={g.id === selecionado}
                  onClick={() => mudarGrupo(g.id)}
                >
                  <strong>{g.grupo}</strong>
                  <small>
                    Nível {g.nivel - pai.nivel} · {revisoes[g.id].alteracoes}{" "}
                    {revisoes[g.id].alteracoes === 1
                      ? "alteração"
                      : "alterações"}
                  </small>
                  {tag(g.id)}
                </button>
              </div>
            ))}
          </aside>
          <main>
            {r ? (
              <>
                <div className="ri-grupo-titulo">
                  <div>
                    <h3>
                      {r.grupo.grupo}{" "}
                      <span className="ri-nivel">
                        Nível {r.grupo.nivel - pai.nivel}
                      </span>
                    </h3>
                    <p>
                      {r.alteracoes}{" "}
                      {r.alteracoes === 1
                        ? "alteração identificada"
                        : "alterações identificadas"}{" "}
                      · Revise as alterações propostas para este grupo.
                    </p>
                  </div>
                  {tag(selecionado)}
                </div>
                <nav
                  className="ri-abas"
                  role="tablist"
                  aria-label="Categorias da revisão"
                >
                  {(["abrangencia", "rubricas"] as const).map((a) => (
                    <button
                      type="button"
                      id={`ri-aba-${a}`}
                      key={a}
                      role="tab"
                      aria-selected={aba === a}
                      aria-controls={`ri-painel-${a}`}
                      className={aba === a ? "ativo" : ""}
                      onClick={() => {
                        setAba(a);
                        setErro("");
                      }}
                    >
                      {a === "abrangencia" ? "Abrangência" : "Rubricas"} (
                      {a === "abrangencia"
                        ? r.abrangencia.length
                        : r.alteracoesRubricas}
                      )
                    </button>
                  ))}
                </nav>
                <div className="ri-conteudo">
                  <section
                    role="tabpanel"
                    id={`ri-painel-${aba}`}
                    aria-labelledby={`ri-aba-${aba}`}
                  >
                    {aba === "abrangencia" ? (
                      <>
                        {r.abrangencia.length ? (
                          <div className="ri-tabela-container">
                            <table className="ri-impactos-tabela">
                              <thead>
                                <tr>
                                  <th>Critério</th>
                                  <th>Configuração atual do filho</th>
                                  <th>Alteração do pai</th>
                                  <th>Ação</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.abrangencia.map((a) => (
                                  <tr key={a.campo}>
                                    <th scope="row">
                                      {camposImpacto[a.campo]}
                                    </th>
                                    <td>{rotulo(a.campo, a.atual)}</td>
                                    <td>
                                      {rotulo(a.campo, a.alteracao)}
                                      <small className="ri-proposta">
                                        Resultante ao aplicar:{" "}
                                        {rotulo(a.campo, a.proposta)}
                                      </small>
                                    </td>
                                    <td>
                                      <div className="ri-escolhas">
                                        <button
                                          type="button"
                                          aria-pressed={a.decisao === "aplicar"}
                                          onClick={() =>
                                            decidir(a.chave, "aplicar")
                                          }
                                        >
                                          Aplicar
                                        </button>
                                        <button
                                          type="button"
                                          aria-pressed={a.decisao === "manter"}
                                          onClick={() =>
                                            decidir(a.chave, "manter")
                                          }
                                        >
                                          Manter atual
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="ri-sem-impacto">
                            Não existem impactos de abrangência a revisar para
                            este grupo.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="ri-lista-resumo">
                          {r.rubricas.filter((l) => l.incluida).length} rubricas
                          na composição resultante · Arraste as rubricas para
                          reordenar.
                        </p>
                        {r.alteracoesRubricas === 0 && (
                          <p className="ri-sem-impacto">
                            Não existem impactos de rubricas a revisar para este
                            grupo.
                          </p>
                        )}
                        <div
                          className="prototype-grupo-calculo-rubricas-list ri-rubricas-lista"
                          role="table"
                          aria-label={`Rubricas de ${r.grupo.grupo}`}
                        >
                          <div
                            className="prototype-grupo-calculo-rubricas-list-head"
                            role="row"
                          >
                            <span role="columnheader" aria-label="Reordenar" />
                            <span role="columnheader">Ordem</span>
                            <span role="columnheader">Código</span>
                            <span role="columnheader">Nome da Rubrica</span>
                            <span role="columnheader">Tipo</span>
                            <span role="columnheader">Ações</span>
                          </div>
                          {r.rubricas.map((l, indice) => {
                            const ordem = l.incluida
                              ? r.rubricas
                                  .slice(0, indice + 1)
                                  .filter((linha) => linha.incluida).length
                              : "—";
                            return (
                              <div
                                key={l.codigo}
                                role="row"
                                className={`prototype-grupo-calculo-rubrica-row ${l.incluida ? (l.origem === "Herdada" ? "is-inherited" : "is-manual") : "is-excluded"}`}
                                draggable={l.incluida}
                                onDragStart={() => setArrastando(indice)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (arrastando !== null)
                                    mover(arrastando, indice);
                                  setArrastando(null);
                                }}
                                onDragEnd={() => setArrastando(null)}
                              >
                                <span role="cell" className="ri-ordem-acoes">
                                  <button
                                    type="button"
                                    className="prototype-grupo-calculo-drag-handle"
                                    disabled={!l.incluida}
                                    aria-label={`Arrastar rubrica ${l.codigo}`}
                                    title="Arraste para reordenar"
                                  >
                                    <i
                                      className="pi pi-bars"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </span>
                                <span role="cell">{ordem}</span>
                                <code role="cell">{l.codigo}</code>
                                <div
                                  role="cell"
                                  className="prototype-grupo-calculo-rubrica-name"
                                >
                                  <strong>{l.nomeRubrica}</strong>
                                  <div className="ri-rubrica-indicadores">
                                    {l.impacto !== "nova" && (
                                      <span
                                        className={`prototype-grupo-calculo-origem-tag ${l.origem === "Herdada" ? "is-inherited" : "is-manual"}`}
                                      >
                                        {l.origem}
                                      </span>
                                    )}
                                    {l.impacto === "nova" && (
                                      <>
                                        <span className="prototype-grupo-calculo-origem-tag ri-nova-herdada">
                                          Nova herdada
                                        </span>
                                        {l.decisao === "manter" && (
                                          <span className="prototype-grupo-calculo-origem-tag is-manual">
                                            Nova do pai
                                          </span>
                                        )}
                                      </>
                                    )}
                                    {l.impacto === "removida" && (
                                      <span className="prototype-grupo-calculo-origem-tag is-changed">
                                        Removida do pai
                                      </span>
                                    )}
                                    {l.ordemAlterada && (
                                      <span className="prototype-grupo-calculo-origem-tag is-reordered">
                                        Ordem alterada
                                      </span>
                                    )}
                                    {!l.incluida && (
                                      <span className="prototype-grupo-calculo-origem-tag is-excluded">
                                        Excluída
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  role="cell"
                                  className={`prototype-grupo-calculo-tipo-pill ${(l.naturezaVerba ?? l.tipo) === "Desconto" ? "ri-tipo-desconto" : (l.naturezaVerba ?? l.tipo) === "Provento" ? "ri-tipo-provento" : ""}`}
                                >
                                  {l.naturezaVerba ?? l.tipo ?? "—"}
                                </span>
                                <span role="cell" className="ri-escolhas">
                                  {l.impacto ? (
                                    <>
                                      <button
                                        type="button"
                                        aria-pressed={l.decisao === "excluir"}
                                        onClick={() =>
                                          decidir(l.chave!, "excluir")
                                        }
                                      >
                                        Excluir
                                      </button>
                                      <button
                                        type="button"
                                        aria-pressed={
                                          l.decisao ===
                                          (l.impacto === "nova"
                                            ? "manter"
                                            : "propria")
                                        }
                                        onClick={() =>
                                          decidir(
                                            l.chave!,
                                            l.impacto === "nova"
                                              ? "manter"
                                              : "propria",
                                          )
                                        }
                                      >
                                        {l.impacto === "nova"
                                          ? "Manter"
                                          : "Manter como própria"}
                                      </button>
                                    </>
                                  ) : null}
                                </span>
                              </div>
                            );
                          })}
                          {!r.rubricas.length && (
                            <p className="prototype-grupo-calculo-rubricas-list-empty">
                              Nenhuma rubrica na composição deste grupo.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </section>
                  {erro && (
                    <p className="ri-validacao-escolha" role="alert">
                      {erro}
                    </p>
                  )}
                  <div className="ri-revisar-grupo">
                    <span>
                      {r.pendencias
                        ? `${r.pendencias} decisões pendentes neste grupo`
                        : revisada(selecionado)
                          ? "Revisão deste grupo concluída."
                          : "Todas as decisões foram tomadas. Confirme a revisão deste grupo."}
                    </span>
                    <BotaoSeplag
                      type="button"
                      className="ri-botao-sigep"
                      label={
                        revisada(selecionado)
                          ? "Grupo revisado"
                          : "Confirmar revisão do grupo"
                      }
                      icon="pi pi-check"
                      disabled={r.pendencias > 0 || revisada(selecionado)}
                      onClick={revisar}
                    />
                  </div>
                  <div className="ri-navegacao">
                    <button
                      type="button"
                      disabled={
                        contexto.arvore.findIndex(
                          (g) => g.id === selecionado,
                        ) === 0
                      }
                      onClick={() =>
                        mudarGrupo(
                          contexto.arvore[
                            contexto.arvore.findIndex(
                              (g) => g.id === selecionado,
                            ) - 1
                          ].id,
                        )
                      }
                    >
                      Anterior
                    </button>
                    <span>
                      {contexto.arvore.findIndex((g) => g.id === selecionado) +
                        1}{" "}
                      de {contexto.arvore.length}
                    </span>
                    <button
                      type="button"
                      disabled={
                        contexto.arvore.findIndex(
                          (g) => g.id === selecionado,
                        ) ===
                        contexto.arvore.length - 1
                      }
                      onClick={() =>
                        mudarGrupo(
                          contexto.arvore[
                            contexto.arvore.findIndex(
                              (g) => g.id === selecionado,
                            ) + 1
                          ].id,
                        )
                      }
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>Nenhum grupo impactado.</p>
            )}
          </main>
        </div>
      </Dialog>
      <Dialog
        visible={confirmacao}
        modal
        onHide={() => setConfirmacao(false)}
        header="Confirmar revisão dos registros impactados"
        className="ri-confirmacao"
        style={{ width: "min(560px, 95vw)" }}
        footer={
          <div className="ri-edicao-rodape">
            <button type="button" onClick={() => setConfirmacao(false)}>
              Voltar
            </button>
            <BotaoSeplag
              type="button"
              className="ri-botao-sigep"
              label="Confirmar e aprovar"
              icon="pi pi-check"
              onClick={confirmar}
            />
          </div>
        }
      >
        <p>
          Todos os grupos impactados foram revisados. Ao continuar, o conjunto
          de alterações será submetido à aprovação e novas versões dos grupos
          descendentes serão geradas.
        </p>
        <p>
          {contexto.arvore.length} grupos impactados · {totalAbrangencia}{" "}
          alterações de abrangência · {totalRubricas} alterações de rubricas.
        </p>
        <p>Início da vigência: {inicio}</p>
      </Dialog>
      <Dialog
        visible={cancelamento}
        modal
        onHide={() => setCancelamento(false)}
        header="Cancelar revisão"
        className="ri-confirmacao"
        style={{ width: "min(480px, 95vw)" }}
        footer={
          <div className="ri-edicao-rodape">
            <button type="button" onClick={() => setCancelamento(false)}>
              Continuar revisão
            </button>
            <button type="button" onClick={onCancel}>
              Descartar e voltar à edição
            </button>
          </div>
        }
      >
        <p>
          Deseja cancelar a revisão? As decisões e os ajustes de ordem
          realizados não serão aplicados.
        </p>
      </Dialog>
    </>
  );
}
