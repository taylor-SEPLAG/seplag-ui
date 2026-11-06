import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import {
  BotaoSeplag,
  BotaoVoltarSeplag,
  BotaoFecharSeplag,
} from "../../componentes/Botao";
import {
  abrangenciaVazia,
  lerAbrangenciaGrupo,
  opcoesAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
} from "./abrangenciaGrupoCalculo";
import "./revisaoImpactados.css";

type Grupo = {
  id: number;
  grupo: string;
  herdaDe: string;
  nivel: number;
  orgaoSetor: string;
  abrangencia?: CriteriosAbrangencia;
  criteriosProprios?: CriteriosAbrangencia;
  composicaoRubricas?: { codigo: string; nomeRubrica: string }[];
  rubricasProprias?: string[];
  versao?: number;
};
type Rubrica = { codigo: string; nomeRubrica: string };
type Campo = keyof CriteriosAbrangencia;
const campos: Record<Campo, string> = {
  regimes: "Regime Jurídico",
  tipos: "Tipo de Vínculo",
  carreiras: "Carreira",
  orgaos: "Órgão/Entidade",
  unidades: "Unidade",
  cargos: "Cargo",
};
const chaves = Object.keys(campos) as Campo[];
type Problema = {
  tipo: "identico" | "invalido" | "relacionado";
  grupoId: number;
  grupo: string;
  nivel: number;
  versao: number;
  criterios: {
    campo: Campo;
    atual: string[];
    conflitante: string[];
    situacao: "Igual" | "Incompatível";
  }[];
};
export type ResultadoRevisao = {
  criteriosPai: CriteriosAbrangencia;
  criteriosPaiAntes: CriteriosAbrangencia;
  grupos: {
    id: number;
    criterios: CriteriosAbrangencia;
    criteriosProprios: CriteriosAbrangencia;
    criteriosAntes: CriteriosAbrangencia;
    rubricas: Rubrica[];
    rubricasProprias: string[];
    versao: number;
    origem: string;
    versaoOrigem: number;
  }[];
  decisoes: Record<string, string>;
  usuario: string;
  dataHora: string;
  inicio: string;
  fimAnterior: string;
  pai: string;
  versaoPai: number;
};
function calcularImpactos(
  descendentes: Grupo[],
  pai: Grupo,
  criteriosPai: CriteriosAbrangencia,
  ajustes: Record<number, CriteriosAbrangencia>,
  versaoPai: number,
  catalogo: CatalogoAbrangencia,
) {
  const resultados: Record<number, CriteriosAbrangencia> = {};
  const problemas: Record<number, Problema[]> = {};
  for (const g of descendentes) {
    const origem = descendentes.find((d) => d.grupo === g.herdaDe) ?? pai;
    const herdados =
      origem.id === pai.id ? criteriosPai : resultados[origem.id];
    const resultado = abrangenciaVazia();
    let restrito = false;
    let invalido = false;
    const camposInvalidos: Campo[] = [];
    for (const c of chaves) {
      const proprio = ajustes[g.id][c];
      resultado[c] = proprio.length
        ? herdados[c].length
          ? proprio.filter((v) => herdados[c].includes(v))
          : [...proprio]
        : [...herdados[c]];
      if (proprio.length && !resultado[c].length) {
        invalido = true;
        camposInvalidos.push(c);
      }
      if (
        resultado[c].length &&
        (!herdados[c].length || resultado[c].length < herdados[c].length)
      )
        restrito = true;
    }
    const opcoes = opcoesAbrangencia(resultado, catalogo);
    for (const c of chaves)
      if (resultado[c].some((v) => !opcoes[c].some((o) => o.value === v))) {
        invalido = true;
        if (!camposInvalidos.includes(c)) camposInvalidos.push(c);
      }
    resultados[g.id] = resultado;
    problemas[g.id] = [];
    if (invalido || !restrito)
      problemas[g.id].push({
        tipo: invalido ? "invalido" : "identico",
        grupoId: origem.id,
        grupo: origem.grupo,
        nivel: origem.nivel - pai.nivel,
        versao: origem.id === pai.id ? versaoPai : (origem.versao ?? 1) + 1,
        criterios: (invalido ? camposInvalidos : chaves).map((c) => ({
          campo: c,
          atual:
            invalido && ajustes[g.id][c].length
              ? ajustes[g.id][c]
              : resultado[c],
          conflitante: herdados[c],
          situacao: invalido ? "Incompatível" : "Igual",
        })),
      });
  }
  // Compara toda a cadeia, incluindo pares fora do mesmo nível.
  for (const g of descendentes) {
    for (const outro of [pai, ...descendentes].filter((d) => d.id !== g.id)) {
      const outraAbrangencia =
        outro.id === pai.id ? criteriosPai : resultados[outro.id];
      if (
        chaves.every(
          (c) =>
            JSON.stringify([...outraAbrangencia[c]].sort()) ===
            JSON.stringify([...resultados[g.id][c]].sort()),
        ) &&
        !problemas[g.id].some((p) => p.grupoId === outro.id)
      ) {
        problemas[g.id].push({
          tipo: "relacionado",
          grupoId: outro.id,
          grupo: outro.grupo,
          nivel: outro.nivel - pai.nivel,
          versao: outro.id === pai.id ? versaoPai : (outro.versao ?? 1) + 1,
          criterios: chaves.map((c) => ({
            campo: c,
            atual: resultados[g.id][c],
            conflitante: outraAbrangencia[c],
            situacao: "Igual",
          })),
        });
      }
    }
  }
  return { resultados, problemas };
}
export function RevisaoImpactados({
  pai,
  grupos,
  criteriosPai,
  catalogo,
  atuais,
  novas,
  versaoPai,
  inicio,
  usuario,
  onCancel,
  onConfirm,
}: {
  pai: Grupo;
  grupos: Grupo[];
  criteriosPai: CriteriosAbrangencia;
  catalogo: CatalogoAbrangencia;
  atuais: Rubrica[];
  novas: Rubrica[];
  versaoPai: number;
  inicio: string;
  usuario: string;
  onCancel: () => void;
  onConfirm: (resultado: ResultadoRevisao) => void;
}) {
  const [descendentes] = useState(() => {
    const lista: Grupo[] = [];
    const visitar = (origem: string) =>
      grupos
        .filter(
          (g) =>
            g.herdaDe === origem &&
            g.id !== pai.id &&
            !lista.some((d) => d.id === g.id),
        )
        .forEach((g) => {
          lista.push(g);
          visitar(g.grupo);
        });
    visitar(pai.grupo);
    return lista;
  });
  const [originais] = useState(
    () =>
      Object.fromEntries(
        descendentes.map((g) => {
          const fallback = g.abrangencia
            ? structuredClone(g.abrangencia)
            : abrangenciaVazia();
          if (!g.abrangencia && g.orgaoSetor !== "Todos")
            fallback.orgaos = catalogo.orgaos
              .filter(
                (o) =>
                  o.value.toLowerCase() === g.orgaoSetor.toLowerCase() ||
                  o.label === g.orgaoSetor,
              )
              .map((o) => o.value);
          return [
            g.id,
            g.criteriosProprios
              ? structuredClone(g.criteriosProprios)
              : lerAbrangenciaGrupo(String(g.id), fallback),
          ];
        }),
      ) as Record<number, CriteriosAbrangencia>,
  );
  const [ajustes, setAjustes] = useState(originais);
  const [paiEmRevisao, setPaiEmRevisao] = useState(() =>
    structuredClone(criteriosPai),
  );
  const [herancaDoPai] = useState(() => {
    const origem = grupos.find((d) => d.grupo === pai.herdaDe);
    return origem
      ? lerAbrangenciaGrupo(
          String(origem.id),
          origem.abrangencia ?? abrangenciaVazia(),
        )
      : abrangenciaVazia();
  });
  const [selecionado, selecionar] = useState(descendentes[0]?.id);
  const [feedback, setFeedback] = useState("");
  const [decisoes, setDecisoes] = useState<Record<string, string>>({});
  const [edicao, setEdicao] = useState<{
    id: number;
    criterios: CriteriosAbrangencia;
  } | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [campo, setCampo] = useState<Campo>("orgaos");
  const [valor, setValor] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);
  const [cancelamento, setCancelamento] = useState(false);
  const [erro, setErro] = useState("");
  const { resultados, problemas } = calcularImpactos(
    descendentes,
    pai,
    paiEmRevisao,
    ajustes,
    versaoPai,
    catalogo,
  );
  const rubricasResultantes: Record<number, Rubrica[]> = {};
  const rubricasPropriasResultantes: Record<number, string[]> = {};
  const removidas: Record<number, Rubrica[]> = {};
  for (const d of descendentes) {
    const origem = descendentes.find((o) => o.grupo === d.herdaDe);
    const herdadas = origem ? rubricasResultantes[origem.id] : novas;
    const composicaoAtual = d.composicaoRubricas ?? atuais;
    const proprias = composicaoAtual.filter(
      (r) =>
        d.rubricasProprias?.includes(r.codigo) &&
        !herdadas.some((n) => n.codigo === r.codigo),
    );
    removidas[d.id] = composicaoAtual.filter(
      (r) =>
        !d.rubricasProprias?.includes(r.codigo) &&
        !herdadas.some((n) => n.codigo === r.codigo),
    );
    rubricasResultantes[d.id] = [
      ...herdadas,
      ...proprias,
      ...removidas[d.id].filter(
        (r) => decisoes[`${d.id}:${r.codigo}`] === "manter",
      ),
    ];
    rubricasPropriasResultantes[d.id] = [
      ...proprias.map((r) => r.codigo),
      ...removidas[d.id]
        .filter((r) => decisoes[`${d.id}:${r.codigo}`] === "manter")
        .map((r) => r.codigo),
    ];
  }
  const pendencias = (id: number) =>
    removidas[id].filter((r) => !decisoes[`${id}:${r.codigo}`]).length;
  const conflitos = descendentes.filter((d) => problemas[d.id].length).length;
  const pendentes = descendentes.reduce((n, d) => n + pendencias(d.id), 0);
  const status = (id: number) =>
    problemas[id].length
      ? "Conflito"
      : pendencias(id)
        ? "Pendente"
        : "Revisado";
  const g = descendentes.find((d) => d.id === selecionado);
  const editando = [pai, ...descendentes].find((d) => d.id === edicao?.id);
  const origemEdicao =
    editando && descendentes.find((d) => d.grupo === editando.herdaDe);
  const herdadosEdicao = origemEdicao
    ? resultados[origemEdicao.id]
    : edicao?.id === pai.id
      ? herancaDoPai
      : paiEmRevisao;
  const sujo =
    JSON.stringify(ajustes) !== JSON.stringify(originais) ||
    JSON.stringify(paiEmRevisao) !== JSON.stringify(criteriosPai) ||
    Object.keys(decisoes).length > 0;
  const cancelar = () => (sujo ? setCancelamento(true) : onCancel());
  const rotulo = (c: Campo, v: string) =>
    catalogo[c].find((o) => o.value === v)?.label ?? v;
  const editar = (d: Grupo) => {
    setEdicao({
      id: d.id,
      criterios: structuredClone(
        d.id === pai.id ? paiEmRevisao : ajustes[d.id],
      ),
    });
    setErroEdicao("");
    setAdicionando(false);
    setValor("");
  };
  const salvarAbrangencia = () => {
    if (!edicao) return;
    const novos =
      edicao.id === pai.id
        ? ajustes
        : { ...ajustes, [edicao.id]: edicao.criterios };
    const novoPai =
      edicao.id === pai.id
        ? (Object.fromEntries(
            chaves.map((c) => [
              c,
              edicao.criterios[c].length
                ? edicao.criterios[c]
                : herdadosEdicao[c],
            ]),
          ) as CriteriosAbrangencia)
        : paiEmRevisao;
    if (
      edicao.id === pai.id &&
      (!chaves.some((c) => novoPai[c].length) ||
        chaves.some(
          (c) =>
            herdadosEdicao[c].length &&
            edicao.criterios[c].some((v) => !herdadosEdicao[c].includes(v)),
        ) ||
        chaves.some((c) =>
          novoPai[c].some(
            (v) =>
              !opcoesAbrangencia(novoPai, catalogo)[c].some(
                (o) => o.value === v,
              ),
          ),
        ))
    ) {
      setErroEdicao("Informe uma abrangência válida para o Grupo Pai.");
      return;
    }
    const recalculo = calcularImpactos(
      descendentes,
      pai,
      novoPai,
      novos,
      versaoPai,
      catalogo,
    );
    const problemasAtuais = recalculo.problemas[selecionado] ?? [];
    setFeedback(
      problemasAtuais.length ? "" : "Conflito resolvido com sucesso.",
    );
    setAjustes(novos);
    setPaiEmRevisao(novoPai);
    setEdicao(null);
  };
  const confirmar = () => {
    if (conflitos || pendentes || edicao) return;
    const [dia, mes, ano] = inicio.split("/").map(Number);
    const fimAnterior = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
    }).format(new Date(Date.UTC(ano, mes - 1, dia - 1)));
    try {
      onConfirm({
        criteriosPai: paiEmRevisao,
        criteriosPaiAntes: criteriosPai,
        pai: pai.grupo,
        versaoPai,
        usuario,
        dataHora: new Date().toISOString(),
        inicio,
        fimAnterior,
        decisoes: Object.fromEntries(
          Object.entries(decisoes).filter(([chave]) =>
            descendentes.some((d) =>
              removidas[d.id].some((r) => chave === `${d.id}:${r.codigo}`),
            ),
          ),
        ),
        grupos: descendentes.map((d) => ({
          id: d.id,
          criterios: resultados[d.id],
          criteriosProprios: ajustes[d.id],
          criteriosAntes: originais[d.id],
          rubricas: rubricasResultantes[d.id],
          rubricasProprias: rubricasPropriasResultantes[d.id],
          versao: (d.versao ?? 1) + 1,
          origem: d.herdaDe,
          versaoOrigem:
            d.herdaDe === pai.grupo
              ? versaoPai
              : (descendentes.find((o) => o.grupo === d.herdaDe)?.versao ?? 1) +
                1,
        })),
      });
    } catch {
      setErro("Não foi possível salvar a revisão. Tente novamente.");
      setConfirmacao(false);
    }
  };
  const tag = (id: number) => (
    <span className={`ri-tag ${status(id).toLowerCase()}`}>{status(id)}</span>
  );
  return (
    <>
      <Dialog
        visible
        modal
        onHide={cancelar}
        className="ri-modal"
        style={{ width: "min(1160px, 96vw)" }}
        header={
          <div className="ri-titulo">
            <i className="pi pi-sitemap" aria-hidden="true" />
            <div>
              <strong>Revisão de Registros Impactados</strong>
              <p>
                Revise os grupos impactados pela nova versão do grupo pai.
                Resolva os conflitos para concluir a aprovação.
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
              <span className="ri-vermelho">
                {conflitos} {conflitos === 1 ? "conflito" : "conflitos"}
              </span>
              <span className="ri-separador">|</span>
              <span className="ri-laranja">
                {pendentes} {pendentes === 1 ? "pendência" : "pendências"}
              </span>
            </div>
            <BotaoFecharSeplag
              className="ri-botao-secundario"
              style={{ minWidth: "auto" }}
              label="Cancelar"
              onClick={cancelar}
            />
            <BotaoSeplag
              type="button"
              className="ri-botao-sigep"
              label="Concluir revisão"
              icon="pi pi-check"
              disabled={conflitos > 0 || pendentes > 0 || !g}
              onClick={() => setConfirmacao(true)}
            />
          </div>
        }
      >
        <div className="ri-corpo">
          <aside aria-label="Grupos impactados">
            <h4>
              Grupos impactados <span>{descendentes.length}</span>
            </h4>
            {descendentes.map((d) => (
              <div
                key={d.id}
                className={d.nivel > pai.nivel + 1 ? "ri-descendente" : ""}
                style={{
                  marginLeft: Math.max(0, d.nivel - pai.nivel - 1) * 16,
                }}
              >
                <button
                  type="button"
                  className={`ri-grupo ${d.id === selecionado ? "ativo" : ""}`}
                  aria-pressed={d.id === selecionado}
                  onClick={() => {
                    selecionar(d.id);

                    setFeedback("");
                  }}
                >
                  <strong>{d.grupo}</strong>
                  <small>Nível {d.nivel - pai.nivel}</small>
                  {tag(d.id)}
                </button>
              </div>
            ))}
          </aside>
          <main>
            {g ? (
              <>
                <div className="ri-grupo-titulo">
                  <div>
                    <h3>
                      {g.grupo}{" "}
                      <span className="ri-nivel">
                        Nível {g.nivel - pai.nivel}
                      </span>
                    </h3>
                  </div>
                  {tag(g.id)}
                </div>
                <div className="ri-conteudo">
                  {problemas[g.id].length > 0 && (
                    <>
                      <div className="ri-alerta" role="alert">
                        <i
                          className="pi pi-exclamation-circle"
                          aria-hidden="true"
                        />
                        <div>
                          <h4>Conflito de abrangência</h4>
                          <p>
                            Este grupo possui abrangência conflitante com outro
                            grupo. Ajuste a abrangência de um dos grupos para
                            diferenciá-los.
                          </p>
                        </div>
                      </div>
                      {problemas[g.id].map((problema) => {
                        const alvo = [pai, ...descendentes].find(
                          (d) => d.id === problema.grupoId,
                        )!;
                        const relevantes = problema.criterios.filter(
                          (c) => c.atual.length || c.conflitante.length,
                        );
                        const abrangenciaAlvo =
                          alvo.id === pai.id
                            ? paiEmRevisao
                            : resultados[alvo.id];
                        const semRestricao = chaves.some(
                          (c) =>
                            !resultados[g.id][c].length &&
                            !abrangenciaAlvo[c].length,
                        );
                        return (
                          <section
                            className="ri-conflito-card"
                            aria-label={`Conflito com ${problema.grupo}`}
                            key={problema.grupoId}
                          >
                            <h4>Grupo conflitante</h4>
                            <div className="ri-conflito-cabecalho">
                              <div className="ri-conflito-identidade">
                                <i
                                  className="pi pi-sitemap"
                                  aria-hidden="true"
                                />
                                <div>
                                  <strong>{problema.grupo}</strong>
                                  <div className="ri-conflito-tags">
                                    <span className="ri-nivel">
                                      V{problema.versao} – nova versão
                                    </span>
                                    <span className="ri-nivel">
                                      Nível {problema.nivel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <BotaoSeplag
                                type="button"
                                className="ri-botao-sigep"
                                label="Editar este grupo"
                                icon="pi pi-pencil"
                                onClick={() => editar(alvo)}
                              />
                            </div>
                            <h5>Abrangências conflitantes</h5>
                            {relevantes.length > 0 && (
                              <div className="ri-tabela-container">
                                <table
                                  aria-label={`Abrangências conflitantes com ${problema.grupo}`}
                                >
                                  <thead>
                                    <tr>
                                      <th>Critério</th>
                                      <th>Grupo atual · {g.grupo}</th>
                                      <th>
                                        Grupo conflitante · {problema.grupo}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {relevantes.map((c) => (
                                      <tr key={c.campo}>
                                        <th scope="row">{campos[c.campo]}</th>
                                        <td>
                                          {c.atual.length
                                            ? c.atual
                                                .map((v) => rotulo(c.campo, v))
                                                .join(", ")
                                            : "Sem restrição"}
                                        </td>
                                        <td>
                                          {c.conflitante.length
                                            ? c.conflitante
                                                .map((v) => rotulo(c.campo, v))
                                                .join(", ")
                                            : "Sem restrição"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {semRestricao && (
                              <p className="ri-criterios-auxiliar">
                                Demais critérios: sem restrição em ambos os
                                grupos.
                              </p>
                            )}
                            <div className="ri-resolucao">
                              <h5>Como deseja resolver?</h5>
                              <div className="ri-resolucao-acoes">
                                <BotaoSeplag
                                  type="button"
                                  className="ri-botao-sigep"
                                  label="Editar grupo atual"
                                  icon="pi pi-pencil"
                                  onClick={() => editar(g)}
                                />
                                <BotaoSeplag
                                  type="button"
                                  className="ri-botao-sigep"
                                  label="Editar grupo conflitante"
                                  icon="pi pi-pencil"
                                  onClick={() => editar(alvo)}
                                />
                              </div>
                            </div>
                          </section>
                        );
                      })}
                    </>
                  )}
                  {removidas[g.id].map((r) => {
                    const decisao = decisoes[`${g.id}:${r.codigo}`];
                    return (
                      <section className="ri-rubrica" key={r.codigo}>
                        <div
                          className={`ri-aviso ${decisao ? "resolvido" : ""}`}
                        >
                          <i
                            className={`pi pi-${decisao ? "check-circle" : "exclamation-triangle"}`}
                            aria-hidden="true"
                          />
                          <strong>Rubrica removida da origem</strong>
                        </div>
                        <p>
                          A rubrica abaixo foi removida da nova versão do grupo
                          pai. Defina como ela deverá ser tratada neste grupo.
                        </p>
                        <h4>
                          {r.codigo} – {r.nomeRubrica}
                        </h4>
                        {["manter", "remover"].map((d) => (
                          <label
                            className={`ri-decisao ${decisao === d ? "selecionada" : ""}`}
                            key={d}
                          >
                            <input
                              type="radio"
                              name={`${g.id}:${r.codigo}`}
                              checked={decisao === d}
                              onChange={() =>
                                setDecisoes({
                                  ...decisoes,
                                  [`${g.id}:${r.codigo}`]: d,
                                })
                              }
                            />
                            <span>
                              <strong>
                                {d === "manter"
                                  ? "Manter rubrica"
                                  : "Remover rubrica"}
                              </strong>
                              <small>
                                {d === "manter"
                                  ? "Permanece no grupo e passa a ser própria."
                                  : "Será removida deste grupo."}
                              </small>
                            </span>
                          </label>
                        ))}
                      </section>
                    );
                  })}
                  {status(g.id) === "Revisado" && (
                    <section className="ri-sucesso" role="status">
                      <i className="pi pi-check-circle" aria-hidden="true" />
                      <div>
                        <p>
                          {feedback ||
                            (removidas[g.id].length ||
                            JSON.stringify(ajustes[g.id]) !==
                              JSON.stringify(originais[g.id])
                              ? "Os conflitos e as pendências deste grupo foram resolvidos."
                              : "As alterações herdadas não geraram conflitos para este grupo.")}
                        </p>
                      </div>
                    </section>
                  )}
                  {erro && (
                    <p className="ri-vermelho" role="alert">
                      {erro}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p>Nenhum grupo impactado.</p>
            )}
          </main>
        </div>
      </Dialog>
      <Dialog
        visible={Boolean(edicao)}
        modal
        onHide={() => setEdicao(null)}
        className="ri-edicao"
        style={{ width: "min(820px, 95vw)" }}
        header={`Editar ${editando?.grupo ?? "grupo"} – Abrangência`}
        footer={
          <div className="ri-edicao-rodape">
            <button type="button" onClick={() => setEdicao(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="ri-primario"
              onClick={salvarAbrangencia}
            >
              Salvar alterações
            </button>
          </div>
        }
      >
        {edicao && editando && (
          <>
            <p className="ri-descricao">
              Defina os critérios de abrangência do grupo.
            </p>
            <div className="ri-herdados">
              <i className="pi pi-info-circle" aria-hidden="true" />
              <span>
                Critérios herdados de <strong>{editando.herdaDe}</strong> são
                preservados. Edite apenas as restrições próprias.
              </span>
            </div>
            <div className="ri-campos">
              {chaves.map((c) => {
                const efetivos = { ...edicao.criterios };
                for (const chave of chaves)
                  if (!efetivos[chave].length)
                    efetivos[chave] = herdadosEdicao[chave];
                const opcoes = opcoesAbrangencia(efetivos, catalogo)[c].filter(
                  (o) =>
                    !herdadosEdicao[c].length ||
                    herdadosEdicao[c].includes(o.value),
                );
                const visiveis = [
                  ...opcoes,
                  ...catalogo[c].filter(
                    (o) =>
                      edicao.criterios[c].includes(o.value) &&
                      !opcoes.some((p) => p.value === o.value),
                  ),
                ];
                return (
                  <label key={c} htmlFor={`ri-${c}`}>
                    <span>{campos[c]}</span>
                    <MultiSelect
                      inputId={`ri-${c}`}
                      value={edicao.criterios[c]}
                      options={visiveis}
                      optionLabel="label"
                      optionValue="value"
                      filter
                      display="chip"
                      placeholder="Selecione..."
                      emptyMessage="Nenhuma opção disponível"
                      emptyFilterMessage="Nenhum resultado"
                      onChange={(e) => {
                        setEdicao({
                          ...edicao,
                          criterios: { ...edicao.criterios, [c]: e.value },
                        });
                        setErroEdicao("");
                      }}
                    />
                    {herdadosEdicao[c].length > 0 && (
                      <small>
                        Herdado:{" "}
                        {herdadosEdicao[c].map((v) => rotulo(c, v)).join(", ")}
                      </small>
                    )}
                  </label>
                );
              })}
            </div>
            <section className="ri-restricoes">
              <h4>
                Critérios próprios de restrição{" "}
                <span className="ri-nivel">
                  {chaves.reduce((n, c) => n + edicao.criterios[c].length, 0)}
                </span>
              </h4>
              <div className="ri-chips">
                {chaves.flatMap((c) =>
                  edicao.criterios[c].map((v) => (
                    <span className="ri-chip" key={`${c}:${v}`}>
                      {campos[c]} | É igual a | {rotulo(c, v)}
                      <button
                        type="button"
                        aria-label={`Remover ${campos[c]}: ${rotulo(c, v)}`}
                        onClick={() => {
                          setEdicao({
                            ...edicao,
                            criterios: {
                              ...edicao.criterios,
                              [c]: edicao.criterios[c].filter((x) => x !== v),
                            },
                          });
                          setErroEdicao("");
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )),
                )}
                {!chaves.some((c) => edicao.criterios[c].length) && (
                  <p className="ri-descricao">
                    Nenhum critério próprio adicionado.
                  </p>
                )}
              </div>
              <button
                type="button"
                className="ri-adicionar"
                onClick={() => setAdicionando(!adicionando)}
              >
                <i className="pi pi-plus" /> Adicionar critério
              </button>
              {adicionando && (
                <div className="ri-adicionar-form">
                  <label>
                    Critério
                    <select
                      value={campo}
                      onChange={(e) => {
                        setCampo(e.target.value as Campo);
                        setValor("");
                      }}
                    >
                      {chaves.map((c) => (
                        <option key={c} value={c}>
                          {campos[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Valor
                    <select
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {catalogo[campo]
                        .filter(
                          (o) =>
                            !herdadosEdicao[campo].length ||
                            herdadosEdicao[campo].includes(o.value),
                        )
                        .map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={!valor}
                    onClick={() => {
                      setEdicao({
                        ...edicao,
                        criterios: {
                          ...edicao.criterios,
                          [campo]: [
                            ...new Set([...edicao.criterios[campo], valor]),
                          ],
                        },
                      });
                      setValor("");
                      setAdicionando(false);
                      setErroEdicao("");
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </section>
            {erroEdicao && (
              <div className="ri-alerta" role="alert">
                {erroEdicao}
              </div>
            )}
          </>
        )}
      </Dialog>
      <Dialog
        visible={confirmacao}
        modal
        header="Confirmar revisão dos registros impactados"
        onHide={() => setConfirmacao(false)}
        className="ri-confirmacao"
        style={{ width: "min(560px, 95vw)" }}
        footer={
          <div className="ri-edicao-rodape">
            <button type="button" onClick={() => setConfirmacao(false)}>
              Voltar
            </button>
            <button type="button" className="ri-primario" onClick={confirmar}>
              Confirmar e aprovar
            </button>
          </div>
        }
      >
        <p>
          Todos os impactos foram revisados. Ao continuar, a nova versão do
          Grupo Pai será aprovada e novas versões dos grupos descendentes
          impactados serão geradas automaticamente.
        </p>
        <p>
          {descendentes.length} descendentes impactados ·{" "}
          {descendentes.length + 1} novas versões
        </p>
        <p>Início da vigência: {inicio}</p>
      </Dialog>
      <Dialog
        visible={cancelamento}
        modal
        header="Cancelar revisão"
        onHide={() => setCancelamento(false)}
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
          Deseja cancelar a revisão? Os ajustes realizados não serão aplicados.
        </p>
      </Dialog>
    </>
  );
}
