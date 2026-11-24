import { InputSwitch } from "primereact/inputswitch";
import { copiarCiclo } from "./copiarCiclo";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import {
  menuGestaoPessoas,
  PrototypeSystemPage,
  PrototiposFolhaCronogramaPage,
} from "../PrototiposPage";
import { PaginacaoV2 } from "../vinculos/VinculoV2Page";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { menuDisponivel, funcionalidades } from "../paginaInicial/model";
import { diaCuiaba } from "./model";
import { CalendarioContent } from "./CalendarioContent";
import {
  CICLOS_PATH,
  calendarioCiclo,
  competenciaValida,
  DUPLICADO,
  excluirCiclo,
  nomeCiclo,
  salvarCiclo,
  type CicloCronograma,
} from "./ciclosRepository";
import { useCiclos } from "./useCiclos";
import "../vinculos/vinculoV2.css";
import "./ciclos.css";
const HOME = "/prototipos/sigep/pagina-inicial";
export function CiclosAmbiente({
  children,
  editor = false,
}: {
  children: ReactNode;
  editor?: boolean;
}) {
  const menu = menuDisponivel(menuGestaoPessoas, getPermissionsSeplag() ?? []);
  const permitido = funcionalidades(menu).some(
    (item) => item.nome === "Painel Informativo",
  );
  if (permitido && editor) return <>{children}</>;
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menu}
    >
      {permitido ? (
        children
      ) : (
        <p role="alert">
          Você não possui permissão para configurar o cronograma.
        </p>
      )}
    </PrototypeSystemPage>
  );
}
export function GestaoCiclosContent() {
  const navigate = useNavigate(),
    { ciclos, carregando, erro } = useCiclos();
  const [consulta, setConsulta] = useSearchParams();
  const anoConsulta = Number(consulta.get("ano"));
  const [ano, setAno] = useState(
      anoConsulta >= 1900 && anoConsulta <= 9999
        ? anoConsulta
        : Number(diaCuiaba().slice(0, 4)),
    ),
    [novo, setNovo] = useState(false),
    [anoNovo, setAnoNovo] = useState(ano),
    [mesNovo, setMesNovo] = useState("");
  const [reaproveitar, setReaproveitar] = useState(false),
    [referencia, setReferencia] = useState("");
  const destinoNovo = `${anoNovo}-${mesNovo}`;
  const referencias = [...ciclos].sort((a, b) =>
    b.competencia.localeCompare(a.competencia),
  );
  const sugestao =
    referencias.find((c) => c.competencia < destinoNovo) ?? referencias[0];
  const referenciaEfetiva = referencias.some(
    (c) => c.competencia === referencia,
  )
    ? referencia
    : (sugestao?.competencia ?? "");
  const [exclusao, setExclusao] = useState<CicloCronograma | null>(null),
    [mensagem, setMensagem] = useState(""),
    [ocupado, setOcupado] = useState(false);
  const [pagina, setPagina] = useState(1),
    [porPagina, setPorPagina] = useState(10);
  const filtrados = ciclos.filter(
      (c) => Number(c.competencia.slice(0, 4)) === ano,
    ),
    totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina)),
    atual = Math.min(pagina, totalPaginas);
  const anos = [
    ...new Set([
      ano,
      anoNovo,
      ...Array.from(
        { length: 11 },
        (_, i) => Number(diaCuiaba().slice(0, 4)) - 5 + i,
      ),
      ...ciclos.map((c) => Number(c.competencia.slice(0, 4))),
    ]),
  ].sort((a, b) => a - b);
  const meses = Array.from({ length: 12 }, (_, i) => ({
    numero: String(i + 1).padStart(2, "0"),
    nome: new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, i, 1))),
  }));
  const continuar = (e: FormEvent) => {
    e.preventDefault();
    const competencia = `${anoNovo}-${mesNovo}`;
    if (!competenciaValida(competencia)) return;
    if (ciclos.some((c) => c.competencia === competencia)) {
      setMensagem(DUPLICADO);
      return;
    }
    if (reaproveitar && referencias.length > 0 && !referenciaEfetiva) {
      setMensagem("Selecione um ciclo de referência cadastrado.");
      return;
    }
    navigate(
      `/prototipos/sigep/cronograma/configurar/${competencia}?novo=1${reaproveitar && referencias.length > 0 ? `&referencia=${referenciaEfetiva}` : ""}`,
    );
  };
  return (
    <main className="prototype-page-content prototype-page-content--white v2v-shell ciclos-shell">
      <CardSeplag
        title="Gestão de Ciclos do Cronograma"
        cols="12"
        cardHeaderClassNames="prototype-carreira-card v2v-card"
        headerNavigation={
          <>
            <BreadcrumbSeplag
              divided
              homeTo={HOME}
              items={[
                { label: "Página Inicial", to: HOME },
                { label: "Cronograma", to: "/prototipos/sigep/cronograma" },
                { label: "Gestão de Ciclos do Cronograma", to: CICLOS_PATH },
              ]}
            />
          </>
        }
      >
        <div className="v2v-page">
          <header className="ciclos-heading">
            <p className="v2v-description">
              Cadastre e gerencie os cronogramas de eventos de cada mês.
            </p>
            <BotaoSeplag
              label="Novo ciclo"
              icon="pi pi-plus"
              disabled={carregando || !!erro}
              onClick={() => {
                setAnoNovo(ano);
                setMesNovo("");
                setReaproveitar(false);
                setReferencia("");
                setMensagem("");
                setNovo(true);
              }}
            />
          </header>
          <section
            className="v2v-panel v2v-filters ciclos-filtro"
            aria-label="Filtros dos ciclos"
          >
            <label>
              Ano
              <select
                value={ano}
                onChange={(e) => {
                  setAno(Number(e.target.value));
                  setConsulta({ ano: e.target.value }, { replace: true });
                  setPagina(1);
                }}
              >
                {anos.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </section>
          {(erro || mensagem) && (
            <p role={erro ? "alert" : "status"}>{erro || mensagem}</p>
          )}
          <section
            className="v2v-panel v2v-management-results"
            aria-label="Ciclos cadastrados"
          >
            <div className="v2v-table-wrap">
              <table className="v2v-table v2v-inner-table">
                <thead>
                  <tr>
                    <th>Ciclo (Mês/Ano)</th>
                    <th>Quantidade de eventos</th>
                    <th>Última atualização</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados
                    .slice((atual - 1) * porPagina, atual * porPagina)
                    .map((c) => (
                      <tr key={c.competencia}>
                        <td>{nomeCiclo(c.competencia)}</td>
                        <td>
                          {c.configuracao.secoes.reduce(
                            (n, s) => n + s.eventos.length,
                            0,
                          )}
                        </td>
                        <td>
                          {c.atualizadoEm &&
                          Number.isFinite(Date.parse(c.atualizadoEm)) ? (
                            <time dateTime={c.atualizadoEm}>
                              {new Intl.DateTimeFormat("pt-BR", {
                                timeZone: "America/Cuiaba",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                                .format(new Date(c.atualizadoEm))
                                .replace(",", "")}
                            </time>
                          ) : (
                            "Não informada"
                          )}
                        </td>
                        <td>
                          <div className="v2v-row-actions">
                            <button
                              type="button"
                              className="v2v-icon-action"
                              title="Visualizar"
                              aria-label={`Visualizar ${nomeCiclo(c.competencia)}`}
                              onClick={() =>
                                navigate(
                                  `/prototipos/sigep/cronograma/configurar/${c.competencia}?visualizar=1`,
                                )
                              }
                            >
                              <i className="pi pi-eye" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="v2v-icon-action v2v-action-edit"
                              title="Editar"
                              aria-label={`Editar ${nomeCiclo(c.competencia)}`}
                              onClick={() =>
                                navigate(
                                  `/prototipos/sigep/cronograma/configurar/${c.competencia}`,
                                )
                              }
                            >
                              <i className="pi pi-pencil" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="v2v-icon-action v2v-action-delete"
                              title="Excluir"
                              aria-label={`Excluir ${nomeCiclo(c.competencia)}`}
                              onClick={() => {
                                setMensagem("");
                                setExclusao(c);
                              }}
                            >
                              <i className="pi pi-trash" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!filtrados.length && (
                    <tr>
                      <td colSpan={4}>
                        {carregando
                          ? "Carregando ciclos…"
                          : erro
                            ? "Consulta de ciclos indisponível."
                            : "Nenhum ciclo cadastrado para o ano selecionado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginacaoV2
              nome="ciclos"
              pagina={atual}
              totalPaginas={totalPaginas}
              porPagina={porPagina}
              mudarPagina={setPagina}
              mudarPorPagina={(n) => {
                setPorPagina(n);
                setPagina(1);
              }}
            />
          </section>

          <Dialog
            visible={novo}
            header="Novo ciclo"
            onHide={() => setNovo(false)}
            style={{ width: "min(520px,95vw)" }}
          >
            <form className="v2v-page ciclos-modal" onSubmit={continuar}>
              <div className="ciclos-periodo">
                <label>
                  Ano
                  <input
                    required
                    type="number"
                    min="1900"
                    max="9999"
                    value={anoNovo || ""}
                    onChange={(e) => {
                      setAnoNovo(Number(e.target.value));
                      setMesNovo("");
                    }}
                  />
                </label>
                <label>
                  Mês
                  <select
                    required
                    value={mesNovo}
                    onChange={(e) => setMesNovo(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {meses.map((m) => (
                      <option
                        key={m.numero}
                        value={m.numero}
                        disabled={ciclos.some(
                          (c) => c.competencia === `${anoNovo}-${m.numero}`,
                        )}
                      >
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="ciclos-reaproveitar">
                <div className="ciclos-toggle">
                  <InputSwitch
                    inputId="ciclos-reaproveitar"
                    checked={reaproveitar && referencias.length > 0}
                    disabled={!referencias.length}
                    onChange={(e) => {
                      setReaproveitar(!!e.value);
                      setReferencia(sugestao?.competencia ?? "");
                    }}
                  />
                  <label htmlFor="ciclos-reaproveitar">
                    Utilizar ciclo anterior como base
                  </label>
                </div>
                <p>
                  Copie os eventos e configurações de um ciclo já existente para
                  o novo ciclo.
                </p>
              </div>
              {reaproveitar && referencias.length > 0 && (
                <section className="ciclos-referencia">
                  <label>
                    Ciclo de referência
                    <select
                      required
                      value={referenciaEfetiva}
                      onChange={(e) => setReferencia(e.target.value)}
                    >
                      {referencias.map((c) => (
                        <option key={c.competencia} value={c.competencia}>
                          {nomeCiclo(c.competencia)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>
                    Os eventos e configurações do ciclo selecionado serão
                    copiados para o novo ciclo e poderão ser ajustados antes de
                    salvar.
                  </p>
                </section>
              )}
              {mensagem && <p role="alert">{mensagem}</p>}
              <div className="v2v-form-actions">
                <BotaoVoltarSeplag
                  type="button"
                  label="Cancelar"
                  onClick={() => setNovo(false)}
                />
                <BotaoSeplag type="submit" label="Continuar" />
              </div>
            </form>
          </Dialog>
          <Dialog
            visible={!!exclusao}
            header="Excluir ciclo"
            onHide={() => {
              if (!ocupado) setExclusao(null);
            }}
            style={{ width: "min(560px,95vw)" }}
          >
            <p>
              Deseja excluir o ciclo de{" "}
              {exclusao && nomeCiclo(exclusao.competencia)}? Todos os eventos
              vinculados a este ciclo também serão excluídos. Esta ação não
              poderá ser desfeita.
            </p>
            {mensagem && <p role="alert">{mensagem}</p>}
            <div className="v2v-form-actions">
              <BotaoVoltarSeplag
                label="Cancelar"
                disabled={ocupado}
                onClick={() => setExclusao(null)}
              />
              <BotaoSeplag
                label="Excluir"
                icon="pi pi-trash"
                severity="danger"
                disabled={ocupado}
                onClick={async () => {
                  if (!exclusao) return;
                  setOcupado(true);
                  try {
                    await excluirCiclo(exclusao.competencia);
                    setExclusao(null);
                    setMensagem("Ciclo excluído com sucesso.");
                  } catch (e) {
                    setMensagem(
                      e instanceof Error
                        ? e.message
                        : "Não foi possível excluir.",
                    );
                  } finally {
                    setOcupado(false);
                  }
                }}
              />
            </div>
          </Dialog>
        </div>
      </CardSeplag>
    </main>
  );
}
export function GestaoCiclosPage() {
  return (
    <CiclosAmbiente>
      <GestaoCiclosContent />
    </CiclosAmbiente>
  );
}
export function EditarCicloContent() {
  const { competencia = "" } = useParams(),
    [params] = useSearchParams(),
    navigate = useNavigate(),
    { ciclos, carregando, erro } = useCiclos();
  const somenteLeitura = params.get("visualizar") === "1";
  const referenciaId = params.get("referencia");
  const referenciaBase = ciclos.find((c) => c.competencia === referenciaId);
  const novo = !somenteLeitura && params.get("novo") === "1",
    ciclo = ciclos.find((c) => c.competencia === competencia);
  if (carregando) return <p role="status">Carregando ciclo…</p>;
  if (
    erro ||
    !competenciaValida(competencia) ||
    (!novo && !ciclo) ||
    (novo && ciclo) ||
    (novo && referenciaId && !referenciaBase)
  )
    return (
      <div>
        <p role="alert">
          {erro ||
            (novo && ciclo
              ? DUPLICADO
              : novo && referenciaId
                ? "Selecione um ciclo de referência cadastrado."
                : "Ciclo não encontrado.")}
        </p>
        <BotaoVoltarSeplag
          label="Voltar"
          onClick={() =>
            navigate(`${CICLOS_PATH}?ano=${competencia.slice(0, 4)}`)
          }
        />
      </div>
    );
  return (
    <EditorCicloPreparado
      key={competencia + (novo ? (referenciaId ?? "") : "")}
      competencia={competencia}
      ciclo={ciclo}
      referencia={novo ? referenciaBase : undefined}
      novo={novo}
      somenteLeitura={somenteLeitura}
    />
  );
}
function EditorCicloPreparado({
  competencia,
  ciclo,
  referencia,
  novo,
  somenteLeitura,
}: {
  competencia: string;
  ciclo?: CicloCronograma;
  referencia?: CicloCronograma;
  novo: boolean;
  somenteLeitura: boolean;
}) {
  const navigate = useNavigate();
  const [rascunho] = useState(() => {
    try {
      if (referencia) {
        const copia = copiarCiclo(referencia, competencia);
        return {
          configuracao: copia.configuracao,
          aviso:
            "Este cronograma foi iniciado com base no ciclo de " +
            nomeCiclo(referencia.competencia) +
            ". Revise as datas e os eventos antes de salvar." +
            (copia.avisos.length ? " " + copia.avisos.join(" ") : ""),
          erro: "",
        };
      }
      return {
        configuracao: structuredClone(
          ciclo?.configuracao ?? {
            tituloCiclo: nomeCiclo(competencia),
            secoes: [],
          },
        ),
        aviso: "",
        erro: "",
      };
    } catch (e) {
      return {
        configuracao: { tituloCiclo: nomeCiclo(competencia), secoes: [] },
        aviso: "",
        erro:
          e instanceof Error ? e.message : "Não foi possível copiar o ciclo.",
      };
    }
  });
  if (rascunho.erro)
    return (
      <div>
        <p role="alert">{rascunho.erro}</p>
        <BotaoVoltarSeplag
          label="Voltar"
          onClick={() => navigate(CICLOS_PATH)}
        />
      </div>
    );
  return (
    <PrototiposFolhaCronogramaPage
      key={competencia}
      sigep
      cicloInicial={rascunho.configuracao}
      avisoInicial={rascunho.aviso}
      competenciaCiclo={competencia}
      somenteLeitura={somenteLeitura}
      aoVoltarCiclos={() =>
        navigate(`${CICLOS_PATH}?ano=${competencia.slice(0, 4)}`)
      }
      aoSalvarCiclo={async (configuracao) => {
        await salvarCiclo({ competencia, configuracao }, novo);
        navigate(`${CICLOS_PATH}?ano=${competencia.slice(0, 4)}`);
      }}
    />
  );
}
export function EditarCicloPage() {
  return (
    <CiclosAmbiente editor>
      <EditarCicloContent />
    </CiclosAmbiente>
  );
}
export function VisualizarCicloContent() {
  const { competencia = "" } = useParams(),
    navigate = useNavigate(),
    { ciclos, carregando, erro } = useCiclos();
  const ciclo = ciclos.find((c) => c.competencia === competencia);
  if (carregando) return <p role="status">Carregando ciclo…</p>;
  if (erro || !ciclo)
    return (
      <div>
        <p role="alert">{erro || "Ciclo não encontrado."}</p>
        <BotaoVoltarSeplag
          label="Voltar"
          onClick={() =>
            navigate(`${CICLOS_PATH}?ano=${competencia.slice(0, 4)}`)
          }
        />
      </div>
    );
  return (
    <CalendarioContent
      key={competencia}
      calendario={calendarioCiclo(ciclo)}
      mesInicial={competencia}
      somenteLeitura
      voltarPath={CICLOS_PATH}
    />
  );
}
export function VisualizarCicloPage() {
  return (
    <CiclosAmbiente>
      <VisualizarCicloContent />
    </CiclosAmbiente>
  );
}
