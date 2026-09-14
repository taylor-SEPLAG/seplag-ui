import { useRef, useState } from "react";
import { CardSeplag } from "@componentes/Card";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import type { TabelaSalva } from "./TabelaVencimentosFeaturePage";
import {
  brDate,
  cents,
  createBatch,
  money,
  nextVersion,
  percentage,
  simulateMatrix,
  validateBatch,
  type Journey,
  type Parameters,
} from "./rgaLote";
import "./rgaLote.css";

type Props = {
  getJourneys: () => Journey[];
  readTables: () => TabelaSalva[];
  onClose: () => void;
  onApply: (records: TabelaSalva[]) => void;
};
const steps = ["Seleção de cargos", "Parâmetros do RGA", "Pré-visualização"];
export function RgaLotePage({
  getJourneys,
  readTables,
  onClose,
  onApply,
}: Props) {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [params, setParams] = useState<Parameters>({
    ano: String(new Date().getFullYear()),
    percentual: "",
    vigencia: "",
    fim: "",
    baseLegal: "",
    arredondamento: "2 casas decimais",
    observacao: "",
  });
  const [legal, setLegal] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Journey[]>([]);
  const [snapshot, setSnapshot] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const submitting = useRef(false);
  const docs = useDocumentosLegaisAssociaveis();
  const journeys = getJourneys().filter((journey) => journey.incideRga);
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = journeys.filter((journey) =>
    normalize(
      String(journey.cargoId).padStart(4, "0") + " " + journey.cargo,
    ).includes(normalize(search)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleJourneys = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const formatPercentage = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    if (!digits) return "";
    return (
      (Number(digits) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  };
  const update = (key: keyof Parameters, value: string) => {
    setParams((previous) => ({ ...previous, [key]: value }));
    setErrors([]);
  };
  const rate =
    percentage(params.percentual).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }) + "%";
  const impactedCargoCount = new Set(
    preview.map((journey) => journey.cargoId),
  ).size;
  const advance = () => {
    if (step === 0) {
      if (selected.length) {
        setErrors([]);
        setStep(1);
      }
      return;
    }
    const picked = journeys.filter((journey) => selected.includes(journey.key));
    const problems = validateBatch(picked, params);
    if (picked.length !== selected.length)
      problems.push(
        "A elegibilidade de uma jornada foi alterada. Revise a seleção.",
      );
    if (problems.length) {
      setErrors(problems);
      return;
    }
    if (step === 1) {
      setPreview(structuredClone(picked));
      setSnapshot(JSON.stringify(readTables()));
    }
    setErrors([]);
    setStep(step + 1);
  };
  const confirm = () => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const saved = readTables();
      if (JSON.stringify(saved) !== snapshot)
        throw new Error(
          "As tabelas foram alteradas após a simulação. Volte aos parâmetros e gere uma nova pré-visualização.",
        );
      onApply(
        createBatch(
          saved,
          preview,
          params,
          new Date().toISOString(),
          crypto.randomUUID(),
        ),
      );
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o lote. Nenhuma aplicação parcial foi realizada.",
      ]);
      submitting.current = false;
    }
  };
  const footer = (
    <div className="tv-batch-footer">
      <div className="tv-batch-footer-left">
        <BotaoVoltarSeplag
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          onClick={onClose}
        />
        <span>{selected.length} jornadas selecionadas</span>
      </div>
      <div>
        {step > 0 && (
          <BotaoVoltarSeplag
            type="button"
            label="Voltar"
            onClick={() => {
              setErrors([]);
              setStep(step - 1);
            }}
          />
        )}

        {step < 2 ? (
          <BotaoSeplag
            type="button"
            label="Avançar"
            disabled={!selected.length}
            onClick={advance}
          />
        ) : (
          <BotaoSeplag
            type="button"
            label="Confirmar aplicação"
            onClick={() => setConfirmationOpen(true)}
          />
        )}
      </div>
    </div>
  );
  return (
    <CardSeplag
      title="Aplicação de RGA em lote"
      cols="12"
      cardHeaderClassNames="prototype-regime-card prototype-ingressos-card tv-list-card"
      headerNavigation={
        <BreadcrumbSeplag
          divided
          items={[
            { label: "Cadastro" },
            { label: "Cargo e Concurso" },
            {
              label: "Tabela de Vencimentos",
              to: "/prototipos/sigep/tabelas-vencimentos",
            },
            { label: "Aplicação de RGA em lote" },
          ]}
        />
      }
    >
      <div className="tv-batch-page">
        <hr className="prototype-ingressos-teste-header-divider" />
        <div className="tv-batch-stepper-card">
          <ol className="tv-batch-steps" aria-label="Etapas da aplicação">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={step === index ? "step" : undefined}
                className={
                  index === step ? "active" : index < step ? "complete" : ""
                }
              >
                <span className="tv-batch-step-number">{index + 1}</span>
                <span className="tv-batch-step-label">{label}</span>
                {step === index && <small>Etapa atual</small>}
              </li>
            ))}
          </ol>
        </div>
        {errors.length > 0 && (
          <div className="tv-error" role="alert">
            <strong>A aplicação não pode continuar.</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {step === 0 && (
          <>
            <div className="tv-rga-info">
              <i className="pi pi-info-circle" />
              <span>
                Selecione os cargos que possuem incidência de RGA. Apenas
                cargos parametrizados para incidir RGA estão disponíveis para
                seleção.
              </span>
            </div>
            <label className="tv-batch-search">
              Buscar cargo
              <select
                autoFocus
                aria-label="Selecionar cargo"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
              >
                <option value="">Todos</option>
                {journeys
                  .filter(
                    (journey, index, all) =>
                      all.findIndex(
                        (item) => item.cargoId === journey.cargoId,
                      ) === index,
                  )
                  .map((journey) => (
                    <option key={journey.cargoId} value={journey.cargo}>
                      {String(journey.cargoId).padStart(4, "0")} —{" "}
                      {journey.cargo}
                    </option>
                  ))}
              </select>
            </label>
            <div className="tv-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Selecionar todas as jornadas desta página"
                        checked={
                          visibleJourneys.length > 0 &&
                          visibleJourneys.every((journey) =>
                            selected.includes(journey.key),
                          )
                        }
                        disabled={!visibleJourneys.length}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [
                                  ...new Set([
                                    ...selected,
                                    ...visibleJourneys.map(
                                      (journey) => journey.key,
                                    ),
                                  ]),
                                ]
                              : selected.filter(
                                  (key) =>
                                    !visibleJourneys.some(
                                      (journey) => journey.key === key,
                                    ),
                                ),
                          )
                        }
                      />
                    </th>
                    <th>Código do cargo</th>
                    <th>Cargo</th>
                    <th>Jornada</th>
                    <th>Versão vigente</th>
                    <th>Vigência</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleJourneys.map((journey) => (
                    <tr key={journey.key}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={
                            "Selecionar " +
                            journey.cargo +
                            " — " +
                            journey.jornada
                          }
                          checked={selected.includes(journey.key)}
                          onChange={(event) =>
                            setSelected(
                              event.target.checked
                                ? [...selected, journey.key]
                                : selected.filter((key) => key !== journey.key),
                            )
                          }
                        />
                      </td>
                      <td>{String(journey.cargoId).padStart(4, "0")}</td>
                      <td>{journey.cargo}</td>
                      <td>{journey.jornada}</td>
                      <td>{journey.item?.numero || "Sem versão vigente"}</td>
                      <td>
                        {journey.item
                          ? journey.item.inicio +
                            " a " +
                            (journey.item.fim || "Atual")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {!visibleJourneys.length && (
                    <tr>
                      <td colSpan={6}>Nenhuma jornada elegível encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <nav
              className="tv-cargo-main-pager tv-batch-pager"
              aria-label="Paginação das jornadas elegíveis"
            >
              <button
                type="button"
                aria-label="Primeira página"
                disabled={currentPage === 0}
                onClick={() => setPage(0)}
              >
                <i className="pi pi-angle-double-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Página anterior"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <i className="pi pi-angle-left" aria-hidden="true" />
              </button>
              <span
                aria-current="page"
                aria-live="polite"
                aria-label={`Página ${currentPage + 1} de ${pageCount}`}
              >
                {currentPage + 1}
              </span>
              <button
                type="button"
                aria-label="Próxima página"
                disabled={currentPage === pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <i className="pi pi-angle-right" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Última página"
                disabled={currentPage === pageCount - 1}
                onClick={() => setPage(pageCount - 1)}
              >
                <i className="pi pi-angle-double-right" aria-hidden="true" />
              </button>
              <div className="tv-cargo-page-size">
                <select
                  aria-label="Jornadas por página"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <i className="pi pi-chevron-down" aria-hidden="true" />
              </div>
            </nav>
          </>
        )}
        {step === 1 && (
          <section className="prototype-novo-ingresso-panel tv-batch-parameters-panel">
            <h3>
              <span className="prototype-novo-ingresso-panel-icon">
                <i className="pi pi-percentage" aria-hidden="true" />
              </span>
              <span>Parâmetros do RGA</span>
            </h3>
            <div className="tv-batch-parameters-content">
              <div className="tv-rga-info">
                <i className="pi pi-info-circle" />
                <span>
                  Os parâmetros informados nesta etapa serão aplicados a todas
                  as jornadas selecionadas.
                </span>
              </div>
              <div className="tv-batch-fields">
                <label>
                  <span>Ano do RGA<span className="tv-required-asterisk" aria-hidden="true">*</span></span>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={params.ano}
                    onChange={(event) => update("ano", event.target.value)}
                  />
                </label>
                <label>
                  <span>Percentual do RGA<span className="tv-required-asterisk" aria-hidden="true">*</span></span>
                  <input
                    required
                    inputMode="decimal"
                    placeholder="0,00%"
                    value={params.percentual}
                    onChange={(event) =>
                      update("percentual", formatPercentage(event.target.value))
                    }
                  />
                </label>
                <label>
                  <span>Data início da vigência do RGA<span className="tv-required-asterisk" aria-hidden="true">*</span></span>
                  <input
                    required
                    type="date"
                    value={params.vigencia}
                    onChange={(event) => update("vigencia", event.target.value)}
                  />
                </label>
                <label>
                  Data fim da vigência do RGA
                  <input
                    type="date"
                    min={params.vigencia || undefined}
                    value={params.fim}
                    onChange={(event) => update("fim", event.target.value)}
                  />
                </label>
                <div className="tv-batch-legal">
                  <DocumentosLegaisAssociadosSeplag
                    label="Base legal da RGA"
                    required
                    options={docs}
                    value={legal}
                    onChange={(value) => {
                      setLegal(value);
                      update(
                        "baseLegal",
                        value
                          .map(
                            (id) =>
                              docs.find((doc) => doc.id === id)?.titulo || id,
                          )
                          .join(", "),
                      );
                    }}
                    placeholder="Buscar documentos legais..."
                    exibirNovoCadastro={false}
                    compact
                    expandirAoAbrir
                  />
                </div>
              </div>
              <p>
                Para percentuais diferentes, realize aplicações em lote
                distintas.
              </p>
            </div>
          </section>
        )}
        {step === 1 && (
          <>
            <section className="tv-batch-observation-card">
              <header>
                <span className="prototype-novo-ingresso-panel-icon">
                  <i className="pi pi-comment" aria-hidden="true" />
                </span>
                <div>
                  <strong>Observação</strong>
                  <small>
                    Registre informações complementares sobre a tabela de
                    vencimentos.
                  </small>
                </div>
              </header>
              <div className="tv-batch-observation-content">
                <label htmlFor="tv-batch-observacao">Observação</label>
                <textarea
                  id="tv-batch-observacao"
                  rows={5}
                  maxLength={2000}
                  value={params.observacao}
                  onChange={(event) => update("observacao", event.target.value)}
                />
                <small>{params.observacao.length}/2000</small>
              </div>
            </section>
          </>
        )}
        {step === 2 && (
          <>
            <h3>Resumo da aplicação</h3>
            <dl className="tv-batch-summary">
              {[
                ["Jornadas selecionadas", preview.length],
                [
                  "Cargos impactados",
                  new Set(preview.map((journey) => journey.cargoId)).size,
                ],
                [
                  "Total de valores a recalcular",
                  preview.reduce(
                    (sum, journey) =>
                      sum +
                      journey.item!.matrix!.rows.length *
                        journey.item!.matrix!.columns.length,
                    0,
                  ),
                ],
                ["Percentual da RGA", rate],
                ["Vigência das novas versões", brDate(params.vigencia)],
                ["Base legal", params.baseLegal],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3>Jornadas que serão atualizadas</h3>
            <div className="tv-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cargo</th>
                    <th>Jornada</th>
                    <th>Versão vigente</th>
                    <th>Nova versão</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((journey) => (
                    <tr key={journey.key}>
                      <td>{String(journey.cargoId).padStart(4, "0")}</td>
                      <td>{journey.cargo}</td>
                      <td>{journey.jornada}</td>
                      <td>{journey.item!.numero}</td>
                      <td>{nextVersion(journey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Pré-visualização dos valores</h3>
            {preview.map((journey) => {
              const source = journey.item!.matrix!;
              const result = simulateMatrix(source, params.percentual);
              return (
                <details className="tv-batch-values" key={journey.key}>
                  <summary>
                    {journey.cargo} — {journey.jornada}
                  </summary>
                  <div className="tv-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Nível</th>
                          <th>Classe</th>
                          <th>Valor vigente</th>
                          <th>Percentual</th>
                          <th>Novo valor</th>
                          <th>Diferença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.flatMap((row, rowIndex) =>
                          result.columns.map((column, columnIndex) => (
                            <tr key={rowIndex + ":" + columnIndex}>
                              <td>{row.name}</td>
                              <td>{column}</td>
                              <td>
                                {source.rows[rowIndex].values[columnIndex]}
                              </td>
                              <td>{rate}</td>
                              <td>{row.values[columnIndex]}</td>
                              <td>
                                +{" "}
                                {money(
                                  (cents(row.values[columnIndex]) -
                                    cents(
                                      source.rows[rowIndex].values[columnIndex],
                                    )) /
                                    100,
                                )}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
            <p>A simulação não altera nenhum dado.</p>
          </>
        )}

        {footer}
        {confirmationOpen && (
          <div className="tv-batch-confirm-overlay" role="presentation">
            <section
              className="tv-batch-confirm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tv-batch-confirm-title"
            >
              <header>
                <h2 id="tv-batch-confirm-title">Confirmar aplicação do RGA?</h2>
              </header>
              <div className="tv-batch-confirm-content">

                <p>
                  A aplicação do RGA irá gerar novas versões das Tabelas de
                  Vencimentos correspondentes aos {impactedCargoCount} cargos
                  selecionados, utilizando o percentual de {rate}, com vigência a
                  partir de {brDate(params.vigencia)}.
                </p>
                <p>
                  Os servidores enquadrados nas novas versões terão o reflexo
                  automático conforme a vigência da nova tabela.
                </p>
                <div className="tv-rga-info">
                  <i className="pi pi-info-circle" aria-hidden="true" />
                  <span>As versões atualmente vigentes permanecerão inalteradas e disponíveis no histórico.</span>
                </div>
                <dl className="tv-batch-confirm-summary">
                  <div>
                    <dt>Jornadas selecionadas</dt>
                    <dd>{preview.length}</dd>
                  </div>
                  <div>
                    <dt>Cargos impactados</dt>
                    <dd>{impactedCargoCount}</dd>
                  </div>
                  <div>
                    <dt>Percentual do RGA</dt>
                    <dd>{rate}</dd>
                  </div>
                  <div>
                    <dt>Vigência</dt>
                    <dd>{brDate(params.vigencia)}</dd>
                  </div>
                </dl>
              </div>
              <footer>
                <BotaoVoltarSeplag
                  type="button"
                  label="Cancelar"
                  onClick={() => setConfirmationOpen(false)}
                />
                <BotaoSeplag
                  type="button"
                  label="Confirmar aplicação"
                  onClick={confirm}
                />
              </footer>
            </section>
          </div>
        )}
      </div>
    </CardSeplag>
  );
}







