import { useEffect, useRef, useState, type FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import {
  FiClock,
  FiDownload,
  FiFileText,
  FiLayers,
  FiSettings,
  FiUpload,
  FiUsers,
} from "react-icons/fi";
import type { ContextoProjeto } from "./AbasProjeto";
import type { HistoriaProjeto } from "./types";
import { GraficoProjeto, type SerieProjeto } from "./GraficoProjeto";
import { KpiProjeto } from "./ComponentesProjeto";
import { baixarArquivo } from "./exportacoes";
import { numero, nomesUnicos } from "./modelo";
import {
  CHAVE_SIMPLES,
  CRITERIOS,
  capacidadeSprint,
  classificacaoUS,
  faixaICA,
  mediaSimples,
  novaBaseSimples,
  tempoUS,
  totalICA,
  unicas,
  validarBaseSimples,
  type Alocacao,
  type BaseSimples,
} from "./analiseSimplesModelo";
import "./produtividadeAnalise.css";
const CORES = [
  "#087bb5",
  "#10a69c",
  "#5b7cc7",
  "#e2a43c",
  "#8c78b8",
  "#52978a",
];
const fmt = (n: number | null) => (n === null ? "Não informado" : numero(n, 1));
function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE_SIMPLES);
    if (!salvo) return { base: novaBaseSimples(), erro: "" };
    const base: unknown = JSON.parse(salvo);
    if (!validarBaseSimples(base)) throw Error();
    return { base, erro: "" };
  } catch {
    return {
      base: novaBaseSimples(),
      erro: "Leitura dos registros indisponível. O conteúdo salvo foi preservado. Exporte uma cópia antes de salvar novos registros.",
    };
  }
}
const alocacaoVazia = (): Alocacao => ({
  id: crypto.randomUUID(),
  analista: "",
  entrada: "",
  saida: "",
  dedicacao: "Integral",
  percentual: null,
});
export default function ProdutividadeAnalise({
  ctx,
}: {
  ctx: ContextoProjeto;
}) {
  const [inicial] = useState(carregar),
    [base, setBase] = useState(inicial.base),
    [mensagem, setMensagem] = useState(inicial.erro);
  const [modal, setModal] = useState(""),
    [us, setUS] = useState(""),
    [analista, setAnalista] = useState("");
  const [criterios, setCriterios] = useState<string[]>(["", "", "", ""]);
  const [inicio, setInicio] = useState(""),
    [envio, setEnvio] = useState(""),
    [aprovacao, setAprovacao] = useState("");
  const [alocacao, setAlocacao] = useState(alocacaoVazia),
    [feriados, setFeriados] = useState("");
  const [complexidadePor, setComplexidadePor] = useState("Sprint"),
    [tempoPor, setTempoPor] = useState("Analista");
  const [detalhe, setDetalhe] = useState<{
    titulo: string;
    historias: HistoriaProjeto[];
    equipe?: Alocacao[];
  } | null>(null);
  const [selecoes, setSelecoes] = useState<Record<string, number>>({});
  const arquivo = useRef<HTMLInputElement>(null);
  const historias = unicas(ctx.historias.filter((h) => h.analistas.length));
  const todas = unicas(ctx.dados.historias);
  const nomes = nomesUnicos([
    ...ctx.dados.historias.flatMap((h) => h.analistas),
    ...base.alocacoes.map((a) => a.analista),
  ]);
  const sprints = ctx.dados.sprints.filter(
    (s) => s.numero >= ctx.filtros.inicial && s.numero <= ctx.filtros.final,
  );
  const porSprint = sprints.map((s) =>
    unicas(
      ctx.historias.filter((h) => h.sprint === s.numero && h.analistas.length),
    ),
  );
  const capacidades = sprints.map((s) =>
    capacidadeSprint(base, s, ctx.filtros.analista),
  );
  const equipe = [
    ...new Map(
      capacidades.flatMap((c) => c?.registros ?? []).map((a) => [a.id, a]),
    ).values(),
  ];
  const ativos = new Set(equipe.map((a) => a.analista)).size;
  const integrais = new Set(
    equipe.filter((a) => a.dedicacao === "Integral").map((a) => a.analista),
  ).size;
  const parciais = new Set(
    equipe.filter((a) => a.dedicacao === "Parcial").map((a) => a.analista),
  ).size;
  const classificados = historias.filter((h) =>
    classificacaoUS(base, h.codigo),
  );
  const comDatas = historias.filter((h) => tempoUS(base, h.codigo) !== null);
  const mediaICA = (hs: HistoriaProjeto[]) =>
    mediaSimples(hs.map((h) => totalICA(classificacaoUS(base, h.codigo))));
  const mediaTempo = (hs: HistoriaProjeto[]) =>
    mediaSimples(hs.map((h) => tempoUS(base, h.codigo)));
  const abrir = (titulo: string, hs = historias, eq?: Alocacao[]) =>
    setDetalhe({ titulo, historias: hs, equipe: eq });
  const salvar = (nova: BaseSimples) => {
    if (!validarBaseSimples(nova)) {
      setMensagem(
        "Confira datas em ordem, quatro critérios entre 1 e 3, percentuais válidos e períodos de alocação sem sobreposição para o mesmo analista.",
      );
      return false;
    }
    try {
      if (
        inicial.erro &&
        localStorage.getItem(CHAVE_SIMPLES) &&
        !localStorage.getItem(`${CHAVE_SIMPLES}:recuperacao`)
      )
        localStorage.setItem(
          `${CHAVE_SIMPLES}:recuperacao`,
          localStorage.getItem(CHAVE_SIMPLES)!,
        );
      localStorage.setItem(CHAVE_SIMPLES, JSON.stringify(nova));
      setBase(nova);
      setMensagem(
        "Registro salvo neste navegador. Exporte uma cópia para preservar os dados.",
      );
      return true;
    } catch {
      setMensagem(
        "Não foi possível salvar. Verifique o armazenamento do navegador.",
      );
      return false;
    }
  };
  function preencher(codigo: string, tipo = modal) {
    setUS(codigo);
    const h = todas.find((h) => h.codigo === codigo),
      c = classificacaoUS(base, codigo),
      l = base.levantamentos.find((l) => l.us === codigo);
    setAnalista(
      (tipo === "levantamento" ? l?.analista : c?.analista) ||
        h?.analistas[0] ||
        "",
    );
    setCriterios(c?.criterios.map(String) ?? ["", "", "", ""]);
    setInicio(l?.inicio ?? "");
    setEnvio(l?.envio ?? "");
    setAprovacao(l?.aprovacao ?? "");
  }
  function cadastrar(tipo: string, codigo = "") {
    setModal(tipo);
    preencher(codigo, tipo);
    if (tipo === "equipe") setAlocacao(alocacaoVazia());
    if (tipo === "feriados") setFeriados(base.feriados.join("\n"));
  }
  useEffect(() => {
    const relatorio = () => setModal("relatorio");
    const limpar = () => setSelecoes({});
    window.addEventListener("sigep:analise-relatorio", relatorio);
    window.addEventListener("sigep:analise-limpar", limpar);
    return () => {
      window.removeEventListener("sigep:analise-relatorio", relatorio);
      window.removeEventListener("sigep:analise-limpar", limpar);
    };
  }, []);
  function submeter(e: FormEvent) {
    e.preventDefault();
    let nova: BaseSimples;
    if (modal === "complexidade")
      nova = {
        ...base,
        classificacoes: [
          ...base.classificacoes,
          {
            us,
            analista,
            criterios: criterios.map(Number),
            registradoEm: new Date().toISOString(),
          },
        ],
      };
    else if (modal === "levantamento")
      nova = {
        ...base,
        levantamentos: [
          ...base.levantamentos.filter((l) => l.us !== us),
          { us, analista, inicio, envio, aprovacao },
        ],
      };
    else if (modal === "feriados")
      nova = {
        ...base,
        feriados: [...new Set(feriados.split(/[\s,;]+/).filter(Boolean))],
      };
    else
      nova = {
        ...base,
        alocacoes: [
          ...base.alocacoes.filter((a) => a.id !== alocacao.id),
          alocacao,
        ],
      };
    if (salvar(nova)) {
      if (modal === "equipe") setAlocacao(alocacaoVazia());
      else setModal("");
    }
  }
  const analistasGrafico = nomesUnicos(
    historias.flatMap((h) => h.analistas),
  ).filter((a) => !ctx.filtros.analista || a === ctx.filtros.analista);
  const labels = sprints.map((s) => `Sprint ${s.numero}`);
  const gruposICA =
    complexidadePor === "Sprint"
      ? porSprint
      : analistasGrafico.map((a) =>
          historias.filter((h) => h.analistas.includes(a)),
        );
  const labelsICA = complexidadePor === "Sprint" ? labels : analistasGrafico;
  const seriesICA: SerieProjeto[] = ["Baixa", "Média", "Alta"].map(
    (faixa, i) => ({
      nome: faixa,
      cor: ["#10a69c", "#e2a43c", "#be6e97"][i],
      valores: gruposICA.map(
        (hs) =>
          hs.filter((h) => faixaICA(classificacaoUS(base, h.codigo)) === faixa)
            .length,
      ),
    }),
  );
  const labelsTempo =
    tempoPor === "Sprint"
      ? labels
      : tempoPor === "Analista"
        ? nomesUnicos([
            ...analistasGrafico,
            ...comDatas.map(
              (h) =>
                base.levantamentos.find((l) => l.us === h.codigo)!.analista,
            ),
          ])
        : ["Baixa", "Média", "Alta", "Não classificada"];
  const gruposTempo =
    tempoPor === "Sprint"
      ? porSprint
      : tempoPor === "Analista"
        ? labelsTempo.map((a) =>
            historias.filter(
              (h) =>
                base.levantamentos.find((l) => l.us === h.codigo)?.analista ===
                a,
            ),
          )
        : labelsTempo.map((f) =>
            historias.filter(
              (h) => faixaICA(classificacaoUS(base, h.codigo)) === f,
            ),
          );
  const destaque = (
    id: string,
    indice: number,
    titulo: string,
    hs: HistoriaProjeto[],
    eq?: Alocacao[],
  ) => {
    setSelecoes((v) => ({ ...v, [id]: indice }));
    abrir(titulo, hs, eq);
  };
  const resumo = sprints.map((s, i) => ({
    sprint: s.numero,
    historias: porSprint[i].length,
    ica: mediaICA(porSprint[i]),
    fte: capacidades[i]?.fte ?? null,
  }));
  const variacao = (a: number | null, b: number | null) =>
    a === null || b === null || a === 0
      ? "Indisponível"
      : `${numero(((b - a) / a) * 100, 1)}%`;
  function tabela(hs: HistoriaProjeto[]) {
    return (
      <div className="ind-table-scroll">
        <table className="ind-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Módulo</th>
              <th>Analista</th>
              <th>Complexidade da Análise</th>
              <th>Levantamento</th>
            </tr>
          </thead>
          <tbody>
            {hs.map((h) => (
              <tr key={h.codigo}>
                <td>{h.codigo}</td>
                <td>{h.titulo}</td>
                <td>{h.modulo || "Não informado"}</td>
                <td>{h.analistas.join(", ")}</td>
                <td>
                  <button
                    className="ind-status"
                    onClick={() => cadastrar("complexidade", h.codigo)}
                  >
                    {faixaICA(classificacaoUS(base, h.codigo))}
                  </button>
                </td>
                <td>
                  <button
                    className="ind-button secondary"
                    onClick={() => cadastrar("levantamento", h.codigo)}
                  >
                    {tempoUS(base, h.codigo) === null
                      ? "Registrar Levantamento"
                      : `${fmt(tempoUS(base, h.codigo))} dias úteis`}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!hs.length && <p>Nenhuma história neste recorte.</p>}
      </div>
    );
  }
  function tabelaEquipe(registros: Alocacao[], editar = false) {
    return (
      <div className="ind-table-scroll">
        <table className="ind-table">
          <thead>
            <tr>
              <th>Analista</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Dedicação</th>
              <th>Percentual</th>
              <th>Situação atual</th>
              {editar && <th>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {registros.map((a) => {
              const hoje = new Date().toLocaleDateString("sv-SE", {
                timeZone: "America/Cuiaba",
              });
              return (
                <tr key={a.id}>
                  <td>{a.analista}</td>
                  <td>{a.entrada}</td>
                  <td>{a.saida || "Não informada"}</td>
                  <td>{a.dedicacao}</td>
                  <td>
                    {a.percentual === null
                      ? "Não informado"
                      : `${a.percentual}%`}
                  </td>
                  <td>
                    {a.entrada > hoje
                      ? "Entrada futura"
                      : a.saida && a.saida < hoje
                        ? "Inativo"
                        : "Ativo"}
                  </td>
                  {editar && (
                    <td>
                      <button
                        type="button"
                        className="ind-button secondary"
                        onClick={() => setAlocacao({ ...a })}
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!registros.length && <p>Alocação histórica não informada.</p>}
      </div>
    );
  }
  return (
    <div className="analise-painel">
      <div className="ind-section-heading">
        <div>
          <h2>Produtividade e Capacidade da Análise</h2>
          <p>
            Acompanhamento da demanda, complexidade e capacidade dos analistas
            de requisitos.
          </p>
        </div>
      </div>
      <div className="analise-acoes">
        <button
          className="ind-button"
          onClick={() => cadastrar("complexidade")}
        >
          <FiLayers /> Classificar Complexidade
        </button>
        <button
          className="ind-button secondary"
          onClick={() => cadastrar("levantamento")}
        >
          <FiClock /> Registrar Levantamento
        </button>
        <button
          className="ind-button secondary"
          onClick={() => cadastrar("equipe")}
        >
          <FiUsers /> Gerenciar Equipe
        </button>
        <button
          className="ind-button secondary"
          onClick={() => cadastrar("feriados")}
        >
          <FiSettings /> Feriados
        </button>
        <button
          className="ind-button secondary"
          onClick={() =>
            baixarArquivo(
              new Blob(
                [localStorage.getItem(CHAVE_SIMPLES) || JSON.stringify(base)],
                { type: "application/json" },
              ),
              "sigep-analise-complementar.json",
            )
          }
        >
          <FiDownload /> Exportar registros
        </button>
        <button
          className="ind-button secondary"
          onClick={() => arquivo.current?.click()}
        >
          <FiUpload /> Importar registros
        </button>
        <input
          ref={arquivo}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (e) => {
            const input = e.currentTarget,
              f = input.files?.[0];
            if (!f) return;
            try {
              const valor: unknown = JSON.parse(await f.text());
              if (!validarBaseSimples(valor)) throw Error();
              localStorage.setItem(
                `${CHAVE_SIMPLES}:antes-importacao`,
                localStorage.getItem(CHAVE_SIMPLES) || JSON.stringify(base),
              );
              salvar(valor);
            } catch {
              setMensagem(
                "Arquivo inválido ou armazenamento indisponível. Os registros atuais foram preservados.",
              );
            }
            input.value = "";
          }}
        />
      </div>
      <p className="analise-fonte">
        Fonte: {ctx.dados.arquivo}. Atribuição de US não comprova escrita ou
        conclusão. Dados complementares são vinculados ao código da US e
        preservados ao atualizar a planilha. A importação de registros restaura
        o arquivo completo, guardando uma cópia anterior neste navegador.
      </p>
      {mensagem && (
        <div className="analise-aviso" role="status">
          {mensagem}
        </div>
      )}
      <div className="ind-kpi-grid">
        <KpiProjeto
          titulo="Histórias atribuídas"
          valor={historias.length}
          icone={<FiFileText />}
          ajuda="US distintas atribuídas no recorte dos filtros globais. US que reaparecem são contadas uma vez neste total."
          nota="Histórias distintas no período"
          periodo={ctx.periodo}
          onClick={() => abrir("Histórias atribuídas")}
        />
        <KpiProjeto
          titulo="Analistas da equipe"
          valor={equipe.length ? ativos : null}
          icone={<FiUsers />}
          ajuda="Pessoas com alocação cadastrada sobreposta ao período histórico das sprints. Dedicações podem mudar no período."
          nota={`${integrais} integral · ${parciais} parcial · ${new Set(equipe.filter((a) => a.saida && a.saida <= (sprints.at(-1)?.fim || "")).map((a) => a.analista)).size} com saída no período`}
          periodo={ctx.periodo}
          onClick={() => abrir("Alocação histórica da equipe", [], equipe)}
        />
        <KpiProjeto
          titulo="Complexidade média da análise"
          valor={mediaICA(historias)}
          textoIndisponivel="Não classificado"
          casas={1}
          icone={<FiLayers />}
          ajuda="Média da soma de quatro critérios de 1 a 3, independente dos story points. Somente US classificadas."
          nota={`${classificados.length} de ${historias.length} US classificadas`}
          periodo={ctx.periodo}
          onClick={() => abrir("Complexidade da análise", classificados)}
        />
        <KpiProjeto
          titulo="Tempo médio de levantamento"
          valor={mediaTempo(historias)}
          casas={1}
          sufixo=" dias úteis"
          icone={<FiClock />}
          ajuda="Dias úteis após o início até o envio para validação, excluindo fins de semana e feriados cadastrados. Não representa horas trabalhadas."
          nota={`${comDatas.length} de ${historias.length} US com datas completas`}
          periodo={ctx.periodo}
          onClick={() => abrir("Tempo de levantamento", comDatas)}
        />
      </div>
      <div className="ind-chart-grid">
        <GraficoProjeto
          id="analise-historias"
          titulo="Evolução das histórias por analista"
          descricao="US distintas por sprint e analista. US compartilhadas aparecem em cada atribuição; a soma pode exceder o total distinto da sprint."
          periodo={ctx.periodo}
          labels={labels}
          series={analistasGrafico.map((a, i) => ({
            nome: a,
            cor: CORES[i % CORES.length],
            valores: porSprint.map(
              (hs) => hs.filter((h) => h.analistas.includes(a)).length,
            ),
          }))}
          empilhado
          selecionado={selecoes.historias}
          onSelecionar={(i, serie) =>
            destaque(
              "historias",
              i,
              `${labels[i]} — ${analistasGrafico[serie]}`,
              porSprint[i].filter((h) =>
                h.analistas.includes(analistasGrafico[serie]),
              ),
            )
          }
        />
        <section>
          <label>
            Complexidade por
            <select
              value={complexidadePor}
              onChange={(e) => {
                setComplexidadePor(e.target.value);
                setSelecoes((v) => ({ ...v, ica: -1 }));
              }}
            >
              <option>Sprint</option>
              <option>Analista</option>
            </select>
          </label>
          <GraficoProjeto
            id="analise-ica"
            titulo="Complexidade da análise"
            descricao={`${historias.length - classificados.length} US não classificadas, sem pontuação atribuída.`}
            periodo={ctx.periodo}
            labels={labelsICA}
            series={seriesICA}
            empilhado
            selecionado={selecoes.ica}
            onSelecionar={(i, serie) =>
              destaque(
                "ica",
                i,
                `Complexidade — ${labelsICA[i]}`,
                gruposICA[i].filter(
                  (h) =>
                    faixaICA(classificacaoUS(base, h.codigo)) ===
                    ["Baixa", "Média", "Alta"][serie],
                ),
              )
            }
          />
          <p className="analise-fonte">
            Média ICA:{" "}
            {labelsICA
              .map(
                (l, i) =>
                  `${l}: ${mediaICA(gruposICA[i]) === null ? "Não classificado" : fmt(mediaICA(gruposICA[i]))}`,
              )
              .join(" · ")}
          </p>
        </section>
        <section>
          <label>
            Tempo médio por
            <select
              value={tempoPor}
              onChange={(e) => {
                setTempoPor(e.target.value);
                setSelecoes((v) => ({ ...v, tempo: -1 }));
              }}
            >
              <option>Analista</option>
              <option>Sprint</option>
              <option>Complexidade</option>
            </select>
          </label>
          <GraficoProjeto
            id="analise-tempo"
            titulo="Tempo médio de levantamento"
            descricao="Duração decorrida da etapa em dias úteis, considerando somente datas completas."
            periodo={ctx.periodo}
            labels={labelsTempo}
            series={[
              {
                nome: "Dias úteis",
                cor: "#087bb5",
                valores: gruposTempo.map(mediaTempo),
              },
            ]}
            selecionado={selecoes.tempo}
            onSelecionar={(i) =>
              destaque(
                "tempo",
                i,
                `Levantamento — ${labelsTempo[i]}`,
                gruposTempo[i].filter((h) => tempoUS(base, h.codigo) !== null),
              )
            }
          />
          <p className="analise-fonte">
            Amostra:{" "}
            {labelsTempo
              .map(
                (l, i) =>
                  `${l}: ${gruposTempo[i].filter((h) => tempoUS(base, h.codigo) !== null).length} US`,
              )
              .join(" · ")}
          </p>
        </section>
        <GraficoProjeto
          id="analise-capacidade"
          titulo="Evolução da capacidade da equipe"
          descricao="Composição histórica cadastrada. Ausência de cadastro não significa equipe zero. Mudança de dedicação pode incluir a pessoa nas duas categorias; o total ativo é distinto."
          periodo={ctx.periodo}
          labels={labels}
          series={[
            {
              nome: "Analistas ativos",
              cor: CORES[0],
              valores: capacidades.map((c) => c?.ativos ?? null),
            },
            {
              nome: "Dedicação integral",
              cor: CORES[1],
              valores: capacidades.map((c) => c?.integral ?? null),
            },
            {
              nome: "Dedicação parcial",
              cor: CORES[3],
              valores: capacidades.map((c) => c?.parcial ?? null),
            },
          ]}
          selecionado={selecoes.capacidade}
          onSelecionar={(i) =>
            destaque(
              "capacidade",
              i,
              `Equipe — ${labels[i]}`,
              [],
              capacidades[i]?.registros ?? [],
            )
          }
        />
      </div>
      <section className="analise-metodo">
        <h3>Evolução da Demanda e da Capacidade</h3>
        <p>
          Capacidade e FTE consideram apenas alocações cadastradas. Complete o
          histórico para avaliar toda a equipe. FTE é a média da dedicação nos
          dias úteis da sprint e só aparece com todos os percentuais
          preenchidos. Aumento de histórias, isoladamente, não permite concluir
          sobrecarga.
        </p>
        <div className="ind-table-scroll">
          <table className="ind-table">
            <thead>
              <tr>
                <th>Sprint</th>
                <th>Histórias atribuídas</th>
                <th>Complexidade média (ICA)</th>
                <th>Capacidade (FTE)</th>
                <th>Variação US / ICA / FTE desde a sprint anterior</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((r, i) => (
                <tr key={r.sprint}>
                  <td>Sprint {r.sprint}</td>
                  <td>{r.historias}</td>
                  <td>{r.ica === null ? "Não classificado" : fmt(r.ica)}</td>
                  <td>{fmt(r.fte)}</td>
                  <td>
                    {i
                      ? `${variacao(resumo[i - 1].historias, r.historias)} / ${variacao(resumo[i - 1].ica, r.ica)} / ${variacao(resumo[i - 1].fte, r.fte)}`
                      : "Sem sprint anterior no recorte"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="analise-metodo">
        <h3>Histórias no período</h3>
        {tabela(historias)}
      </section>
      <Sidebar
        visible={detalhe !== null}
        position="right"
        style={{ width: "min(1050px, 96vw)" }}
        header={detalhe?.titulo}
        onHide={() => setDetalhe(null)}
      >
        {detalhe &&
          (detalhe.equipe
            ? tabelaEquipe(detalhe.equipe)
            : tabela(detalhe.historias))}
      </Sidebar>
      <Dialog
        visible={!!modal}
        header={
          (
            {
              complexidade: "Classificar Complexidade",
              levantamento: "Registrar Levantamento",
              equipe: "Gerenciar Equipe",
              feriados: "Feriados aplicáveis",
              relatorio: "Relatório da análise",
            } as Record<string, string>
          )[modal]
        }
        onHide={() => setModal("")}
        className="analise-dialog"
        style={{ width: "min(960px, 96vw)" }}
      >
        {modal === "relatorio" ? (
          <>
            <p>
              {ctx.periodo}: {historias.length} histórias distintas;{" "}
              {classificados.length} classificadas; {comDatas.length} com datas
              completas. ICA médio:{" "}
              {mediaICA(historias) === null
                ? "Não classificado"
                : fmt(mediaICA(historias))}
              . Tempo médio: {fmt(mediaTempo(historias))} dias úteis.
            </p>
            <button
              className="ind-button"
              onClick={() =>
                baixarArquivo(
                  new Blob(
                    [JSON.stringify({ periodo: ctx.periodo, resumo }, null, 2)],
                    { type: "application/json" },
                  ),
                  "sigep-resumo-analise.json",
                )
              }
            >
              Exportar resumo
            </button>
          </>
        ) : (
          <form onSubmit={submeter}>
            {(modal === "complexidade" || modal === "levantamento") && (
              <div className="analise-form-grid">
                <label>
                  Seleção da US
                  <select
                    required
                    value={us}
                    onChange={(e) => preencher(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {todas.map((h) => (
                      <option key={h.codigo} value={h.codigo}>
                        {h.codigo} — {h.titulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Analista responsável
                  <select
                    required
                    value={analista}
                    onChange={(e) => setAnalista(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {nomes.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                {modal === "complexidade" ? (
                  <>
                    <fieldset className="analise-dimensoes">
                      <legend>Índice de Complexidade da Análise (ICA)</legend>
                      {CRITERIOS.map((c, i) => (
                        <label key={c.nome}>
                          {c.nome}
                          <select
                            required
                            value={criterios[i]}
                            onChange={(e) =>
                              setCriterios((v) =>
                                v.map((n, j) => (j === i ? e.target.value : n)),
                              )
                            }
                          >
                            <option value="">Selecione</option>
                            {c.opcoes.map((o, j) => (
                              <option key={o} value={j + 1}>
                                {j + 1}: {o}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </fieldset>
                    <output>
                      {criterios.every(Boolean)
                        ? `${criterios.reduce((a, b) => a + Number(b), 0)} pontos — ${faixaICA({ us, analista, criterios: criterios.map(Number), registradoEm: "" })}`
                        : "Não classificado"}
                    </output>
                    <div>
                      <h4>Histórico da classificação</h4>
                      {base.classificacoes
                        .filter((c) => c.us === us)
                        .map((c, i) => (
                          <p key={i}>
                            {c.registradoEm} · {c.analista} · {totalICA(c)}{" "}
                            pontos · {faixaICA(c)}
                          </p>
                        ))}
                    </div>
                  </>
                ) : (
                  <>
                    <label>
                      Data de início do levantamento
                      <input
                        required
                        type="date"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                      />
                    </label>
                    <label>
                      Data de envio para validação
                      <input
                        type="date"
                        min={inicio}
                        value={envio}
                        onChange={(e) => setEnvio(e.target.value)}
                      />
                    </label>
                    <label>
                      Data de aprovação final (opcional)
                      <input
                        type="date"
                        min={envio || inicio}
                        value={aprovacao}
                        onChange={(e) => setAprovacao(e.target.value)}
                      />
                    </label>
                    <output>
                      Dias úteis:{" "}
                      {fmt(
                        tempoUS(
                          {
                            ...base,
                            levantamentos: [
                              { us, analista, inicio, envio, aprovacao },
                            ],
                          },
                          us,
                        ),
                      )}
                    </output>
                  </>
                )}
              </div>
            )}
            {modal === "equipe" && (
              <>
                <p>
                  Referência atual: Isabeli e Danielle, dedicação integral;
                  Carlos (SINOVA, Banco de Talentos e Escritório de Processos) e
                  Taylor (RECAD, SICAD e DBV), dedicação parcial. Marcela atuou
                  integralmente e saiu do projeto. Informe datas e percentuais
                  confirmados para compor o histórico; a referência atual não é
                  aplicada retroativamente.
                </p>
                {tabelaEquipe(base.alocacoes, true)}
                <div className="analise-form-grid">
                  <label>
                    Analista
                    <input
                      required
                      list="analise-nomes"
                      value={alocacao.analista}
                      onChange={(e) =>
                        setAlocacao({ ...alocacao, analista: e.target.value })
                      }
                    />
                  </label>
                  <datalist id="analise-nomes">
                    {nomesUnicos([
                      ...nomes,
                      "Isabeli",
                      "Danielle",
                      "Carlos",
                      "Taylor",
                      "Marcela",
                    ]).map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </datalist>
                  <label>
                    Data de entrada no SIGEP / início da alocação
                    <input
                      required
                      type="date"
                      value={alocacao.entrada}
                      onChange={(e) =>
                        setAlocacao({ ...alocacao, entrada: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Data de saída / fim da alocação
                    <input
                      type="date"
                      min={alocacao.entrada}
                      value={alocacao.saida}
                      onChange={(e) =>
                        setAlocacao({ ...alocacao, saida: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Tipo de dedicação
                    <select
                      value={alocacao.dedicacao}
                      onChange={(e) =>
                        setAlocacao({
                          ...alocacao,
                          dedicacao: e.target.value as Alocacao["dedicacao"],
                          percentual: null,
                        })
                      }
                    >
                      <option>Integral</option>
                      <option>Parcial</option>
                    </select>
                  </label>
                  <label>
                    Percentual de dedicação ao SIGEP (opcional)
                    <input
                      type="number"
                      min="0.01"
                      max={alocacao.dedicacao === "Integral" ? 100 : 99.99}
                      step="0.01"
                      value={alocacao.percentual ?? ""}
                      onChange={(e) =>
                        setAlocacao({
                          ...alocacao,
                          percentual:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <p>
                  Para mudar a dedicação, encerre o período anterior e adicione
                  outro a partir do dia seguinte. Situação ativa/inativa é
                  calculada pelas datas. Dedicação integral aceita 100% ou
                  percentual não informado.
                </p>
                <button
                  className="ind-button secondary"
                  type="button"
                  onClick={() => setAlocacao(alocacaoVazia())}
                >
                  Novo período de alocação
                </button>
              </>
            )}
            {modal === "feriados" && (
              <label>
                Datas dos feriados (AAAA-MM-DD, uma por linha)
                <textarea
                  rows={8}
                  value={feriados}
                  onChange={(e) => setFeriados(e.target.value)}
                />
              </label>
            )}
            <div className="analise-acoes">
              <button className="ind-button" type="submit">
                Salvar
              </button>
              <button
                className="ind-button secondary"
                type="button"
                onClick={() => setModal("")}
              >
                Fechar
              </button>
            </div>
          </form>
        )}
        {mensagem && <p role="status">{mensagem}</p>}
      </Dialog>
    </div>
  );
}
