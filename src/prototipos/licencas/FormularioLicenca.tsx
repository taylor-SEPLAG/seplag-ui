import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DocumentosLegaisAssociadosSeplag } from "../../componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";

import { Ambiente } from "./AmbienteLicencas";
import { HistoricoEvento } from "./HistoricoEvento";
import {
  BASE_LICENCAS as BASE,
  NATUREZAS,
  OPCOES_VINCULOS,
  GRAUS_PARENTESCO,
  carregarEventos,
  clonarEvento,
  configuracaoDoEvento,
  proximoCodigo,
  salvarEvento,
  type EventoLicenca,
  type ConfiguracaoEvento,
  type EfeitoFinanceiro,
} from "./model";

const efeitoInicial = (vinculo: string): EfeitoFinanceiro => ({
  geraOnus: vinculo !== "Temporário",
  suspendeRemuneracao: vinculo === "Temporário",
  diaInicioSuspensao: vinculo === "Temporário" ? 1 : null,
});

function SelecaoMultipla({
  titulo,
  opcoes,
  valores,
  alterar,
  pesquisavel = false,
}: {
  titulo: string;
  opcoes: { value: string; label: string }[];
  valores: string[];
  alterar: (valores: string[]) => void;
  pesquisavel?: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null),
    id = useId();
  const [busca, setBusca] = useState("");
  useEffect(() => {
    const fechar = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node))
        ref.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", fechar);
    return () => document.removeEventListener("pointerdown", fechar);
  }, []);
  const normalizar = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const visiveis = opcoes.filter((o) =>
    normalizar(o.label).includes(normalizar(busca)),
  );
  return (
    <div className="pl-multiselect-field">
      <span id={id}>
        {titulo} <em>*</em>
      </span>
      <details
        className="pl-multiselect"
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            ref.current?.removeAttribute("open");
            ref.current?.querySelector("summary")?.focus();
          }
        }}
        onBlur={(e) => {
          if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget))
            ref.current?.removeAttribute("open");
        }}
      >
        <summary aria-labelledby={`${id} ${id}-valor`}>
          <span id={`${id}-valor`}>
            {valores.length === 0
              ? "Selecione uma ou mais opções"
              : valores.length === 1
                ? opcoes.find((o) => o.value === valores[0])?.label
                : `${valores.length} opções selecionadas`}
          </span>
          <i className="pi pi-chevron-down" aria-hidden="true" />
        </summary>
        <div className="pl-multiselect-popup">
          {pesquisavel && (
            <input
              aria-label={`Buscar ${titulo.toLocaleLowerCase("pt-BR")}`}
              placeholder="Pesquisar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          )}
          <div className="pl-multiselect-options">
            {visiveis.map((o) => (
              <label key={o.value}>
                <input
                  type="checkbox"
                  checked={valores.includes(o.value)}
                  onChange={(e) =>
                    alterar(
                      e.target.checked
                        ? [...valores, o.value]
                        : valores.filter((v) => v !== o.value),
                    )
                  }
                />
                {o.label}
              </label>
            ))}
            {!visiveis.length && <p>Nenhuma opção encontrada.</p>}
          </div>
        </div>
      </details>
    </div>
  );
}

function Secao({
  id,
  icone,
  titulo,
  descricao,
  children,
}: {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section
      className="v2v-panel v2v-form-section pl-config-section"
      aria-labelledby={id}
    >
      <header className="v2v-section-header">
        <i className={`pi ${icone}`} aria-hidden="true" />
        <div>
          <h2 id={id}>{titulo}</h2>
          <p>{descricao}</p>
        </div>
      </header>
      <div className="v2v-section-body">{children}</div>
    </section>
  );
}

export function ParametrizacaoLicencasFormPage({
  clonar = false,
  visualizar = false,
}: {
  clonar?: boolean;
  visualizar?: boolean;
}) {
  const { id } = useParams(),
    navigate = useNavigate();
  const location = useLocation();
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const documentosLegais = useDocumentosLegaisAssociaveis();
  const chaveRascunho = `sigep-licencas-rascunho:${location.pathname}`;
  const [rascunho] = useState<{
    evento: EventoLicenca;
    config: ConfiguracaoEvento;
  } | null>(() => {
    if (visualizar) return null;
    try {
      const salvo = sessionStorage.getItem(chaveRascunho);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    sessionStorage.removeItem(chaveRascunho);
  }, [chaveRascunho]);
  const [original] = useState(() =>
    id ? carregarEventos().find((e) => e.id === id) : undefined,
  );
  const [evento, setEvento] = useState<EventoLicenca>(
    () =>
      rascunho?.evento ??
      (original
        ? clonar
          ? clonarEvento(original)
          : structuredClone(original)
        : {
            id: crypto.randomUUID(),
            codigo: proximoCodigo(),
            nome: "",
            descricao: "",
            natureza: "Licença",
            categoria: "",
            vinculos: [],
            duracao: "Dias corridos",
            quantidade: 1,
            parentesco: false,
            recorrencia: "",
            situacao: "Ativo",
          }),
  );
  const [config, setConfig] = useState<ConfiguracaoEvento>(() => {
    const dados = rascunho?.config ?? configuracaoDoEvento(evento);
    return {
      ...dados,
      efeitosFinanceiros: Object.fromEntries(
        evento.vinculos.map((v) => [
          v,
          dados.efeitosFinanceiros?.[v] ?? efeitoInicial(v),
        ]),
      ),
    };
  });
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState<"dados" | "financeiros">("dados");
  const [financeirosHabilitados, setFinanceirosHabilitados] = useState(visualizar);
  const avancar = () => {
    setFinanceirosHabilitados(true);
    setAba("financeiros");
    setErro("");
    document.getElementById("pl-aba-financeiros")?.focus();
  };
  const titulo = visualizar ? "Visualizar Parametrização" : clonar
    ? "Duplicar Parametrização"
    : id
      ? "Editar Parametrização"
      : "Nova Parametrização";
  const mudar = <K extends keyof EventoLicenca>(
    campo: K,
    valor: EventoLicenca[K],
  ) => setEvento((e) => ({ ...e, [campo]: valor }));
  const configurar = <K extends keyof ConfiguracaoEvento>(
    campo: K,
    valor: ConfiguracaoEvento[K],
  ) => setConfig((c) => ({ ...c, [campo]: valor }));
  const mudarEfeito = (vinculo: string, alteracao: Partial<EfeitoFinanceiro>) =>
    setConfig((c) => ({
      ...c,
      efeitosFinanceiros: {
        ...c.efeitosFinanceiros,
        [vinculo]: {
          ...(c.efeitosFinanceiros?.[vinculo] ?? efeitoInicial(vinculo)),
          ...alteracao,
        },
      },
    }));
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (visualizar) return;
    if (aba === "dados" || !financeirosHabilitados) {
      avancar();
      return;
    }
    const recorrencia = config.travaRecorrencia
      ? `${config.recorrenciaQuantidade}x / ${config.recorrenciaIntervalo} ${config.recorrenciaUnidade}`
      : "";
    const duracao = config.semLimite
      ? "Sem limite"
      : config.abrangencias.length === 1 &&
          config.abrangencias[0] === "Por Horas"
        ? "Por horas"
        : "Dias corridos";
    try {
      salvarEvento(
        {
          ...evento,
          configuracao: {
            ...config,
            contagem: "Dias corridos",
            efeitosFinanceiros: Object.fromEntries(
              evento.vinculos.map((v) => {
                const efeito =
                  config.efeitosFinanceiros?.[v] ?? efeitoInicial(v);
                return [
                  v,
                  {
                    ...efeito,
                    diaInicioSuspensao: efeito.suspendeRemuneracao
                      ? efeito.diaInicioSuspensao
                      : null,
                  },
                ];
              }),
            ),
            documentosLegaisIds: config.documentosLegaisIds ?? [],
            grausParentesco: evento.parentesco ? config.grausParentesco : [],
          },
          descricao: config.fundamentoLegal,
          recorrencia,
          duracao,
        },
        carregarEventos(),
      );
      navigate(BASE);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a parametrização.",
      );
    }
  };
  if (id && !original)
    return (
      <Ambiente titulo={titulo}>
        <p className="v2v-empty">Evento não encontrado.</p>
        <Link className="v2v-secondary" to={BASE}>
          Voltar
        </Link>
      </Ambiente>
    );
  return (
    <Ambiente titulo={titulo}>
      {clonar && (
        <p className="v2v-description">
          Nova parametrização baseada em {original?.codigo}.
        </p>
      )}
      {original && !clonar && !visualizar && <button type="button" className="v2v-secondary" onClick={() => setHistoricoAberto(true)}><i className="pi pi-history" aria-hidden="true"/>Histórico</button>}
      <HistoricoEvento evento={historicoAberto ? original ?? null : null} fechar={() => setHistoricoAberto(false)}/>
      <form
        onSubmit={salvar}
        className="v2v-form pl-config-form"
        onInvalidCapture={(e) => {
          const painel = (e.target as HTMLElement).closest('[role="tabpanel"]');
          if (painel)
            flushSync(() =>
              setAba(
                painel.id === "pl-painel-financeiros" ? "financeiros" : "dados",
              ),
            );
        }}
      >
        <div
          className="pl-config-tabs"
          role="tablist"
          aria-label="Abas da parametrização"
        >
          {(["dados", "financeiros"] as const).map((valor, indice) => (
            <button
              type="button"
              role="tab"
              disabled={valor === "financeiros" && !financeirosHabilitados}
              key={valor}
              id={`pl-aba-${valor}`}
              aria-selected={aba === valor}
              aria-controls={`pl-painel-${valor}`}
              tabIndex={aba === valor ? 0 : -1}
              onClick={() => {
                if (valor === "dados" || financeirosHabilitados) setAba(valor);
              }}
              onKeyDown={(e) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                ) {
                  e.preventDefault();
                  const proxima =
                    e.key === "Home"
                      ? "dados"
                      : e.key === "End"
                        ? "financeiros"
                        : indice === 0
                          ? "financeiros"
                          : "dados";
                  if (proxima === "financeiros" && !financeirosHabilitados) return;
                  setAba(proxima);
                  document.getElementById(`pl-aba-${proxima}`)?.focus();
                }
              }}
            >
              {valor === "dados"
                ? "Dados da parametrização"
                : "Efeitos financeiros por tipo de vínculo"}
            </button>
          ))}
        </div>
        <fieldset disabled={visualizar} className="pl-config-fields" aria-label={visualizar ? 'Parametrização em modo de leitura' : 'Campos da parametrização'}>
        <div
          role="tabpanel"
          id="pl-painel-dados"
          aria-labelledby="pl-aba-dados"
          hidden={aba !== "dados"}
        >
          <Secao
            id="pl-identificacao"
            icone="pi-file"
            titulo="Identificação do Evento e Vigência"
            descricao="Informe a identificação, a classificação e o período de validade do evento."
          >
            <div className="pl-config-grid">
              <label className="pl-col-2">
                <span>
                  Código Interno <em>*</em>
                </span>
                <input
                  value={evento.codigo}
                  readOnly
                  aria-label="Código Interno *"
                />
              </label>
              <label className="pl-col-6">
                <span>
                  Nome da Ocorrência (Exibido no Lançamento) <em>*</em>
                </span>
                <input
                  required
                  maxLength={200}
                  value={evento.nome}
                  onChange={(e) => mudar("nome", e.target.value)}
                />
              </label>
              <label className="pl-col-2">
                <span>
                  Data Início Vigência <em>*</em>
                </span>
                <input
                  type="date"
                  required
                  value={config.inicioVigencia}
                  onChange={(e) => configurar("inicioVigencia", e.target.value)}
                />
              </label>
              <label className="pl-col-2">
                <span>Data Fim Vigência</span>
                <input
                  type="date"
                  aria-label="Data Fim Vigência"
                  aria-describedby="pl-fim-ajuda"
                  min={config.inicioVigencia || undefined}
                  value={config.fimVigencia}
                  onChange={(e) => configurar("fimVigencia", e.target.value)}
                />
                <small id="pl-fim-ajuda">Vazio = Vigência Aberta</small>
              </label>
              <div className="pl-col-8 pl-amparo-legal">
                <DocumentosLegaisAssociadosSeplag
                  disabled={visualizar}
                  label="Amparo Legal"
                  required
                  options={documentosLegais}
                  value={config.documentosLegaisIds ?? []}
                  onChange={(ids) =>
                    setConfig((c) => ({
                      ...c,
                      documentosLegaisIds: ids,
                      fundamentoLegal: ids
                        .map(
                          (id) =>
                            documentosLegais.find((d) => d.id === id)?.titulo ??
                            "",
                        )
                        .filter(Boolean)
                        .join("; "),
                    }))
                  }
                  onNovoCadastro={() => {
                    sessionStorage.setItem(
                      chaveRascunho,
                      JSON.stringify({ evento, config }),
                    );
                    navigate(
                      `/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`,
                    );
                  }}
                  expandirAoAbrir
                />
                {!config.documentosLegaisIds?.length &&
                  config.fundamentoLegal && (
                    <small>Referência anterior: {config.fundamentoLegal}</small>
                  )}
              </div>
              <label className="pl-col-4">
                <span>
                  Tipo <em>*</em>
                </span>
                <select
                  value={evento.natureza}
                  onChange={(e) =>
                    mudar(
                      "natureza",
                      e.target.value as EventoLicenca["natureza"],
                    )
                  }
                >
                  {NATUREZAS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="pl-col-12">
                <span>Observação</span>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={config.orientacao}
                  onChange={(e) => configurar("orientacao", e.target.value)}
                />
              </label>
            </div>
          </Secao>
          <Secao
            id="pl-aplicabilidade"
            icone="pi-users"
            titulo="Aplicabilidade por Tipo de Vínculo Funcional"
            descricao="Selecione um ou mais tipos de vínculo aos quais a parametrização se aplica."
          >
            <SelecaoMultipla
              titulo="Tipos de Vínculo"
              opcoes={OPCOES_VINCULOS}
              valores={evento.vinculos}
              alterar={(v) => {
                mudar("vinculos", v);
                setConfig((c) => ({
                  ...c,
                  efeitosFinanceiros: {
                    ...c.efeitosFinanceiros,
                    ...Object.fromEntries(
                      v
                        .filter((chave) => !c.efeitosFinanceiros?.[chave])
                        .map((chave) => [chave, efeitoInicial(chave)]),
                    ),
                  },
                }));
              }}
              pesquisavel
            />
          </Secao>
          <Secao
            id="pl-regras"
            icone="pi-sliders-h"
            titulo="Regras de Duração, Limites e Recorrência"
            descricao="Defina a duração, a abrangência e as condições para o lançamento."
          >
            <div className="pl-config-grid">
              <div className="pl-col-4">
                <label>
                  <span>
                    Dias Máximos Permitidos (Dias corridos) <em>*</em>
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required={!config.semLimite}
                    disabled={config.semLimite}
                    value={config.semLimite ? "" : evento.quantidade}
                    placeholder={config.semLimite ? "Sem Limite" : "Ex.: 8"}
                    onChange={(e) =>
                      mudar("quantidade", Number(e.target.value))
                    }
                  />
                </label>
                <label className="pl-check-inline">
                  <input
                    type="checkbox"
                    checked={config.semLimite}
                    onChange={(e) => configurar("semLimite", e.target.checked)}
                  />
                  Sem Limite de Dias
                </label>
              </div>
              <div className="pl-col-4">
                <SelecaoMultipla
                  titulo="Abrangência"
                  opcoes={["Dia Integral", "Por Horas"].map((v) => ({
                    label: v,
                    value: v,
                  }))}
                  valores={config.abrangencias}
                  alterar={(v) => configurar("abrangencias", v)}
                />
              </div>
              <label className="pl-col-4">
                <span>
                  Possui Trava de Recorrência? <em>*</em>
                </span>
                <select
                  value={String(config.travaRecorrencia)}
                  onChange={(e) =>
                    configurar("travaRecorrencia", e.target.value === "true")
                  }
                >
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </label>
              {config.travaRecorrencia && (
                <fieldset className="pl-col-12 pl-recurrence">
                  <legend>Janela de Recorrência Configurada</legend>
                  <div>
                    <span>Permitir no máximo</span>
                    <input
                      aria-label="Quantidade de ocorrências"
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={config.recorrenciaQuantidade}
                      onChange={(e) =>
                        configurar(
                          "recorrenciaQuantidade",
                          Number(e.target.value),
                        )
                      }
                    />
                    <span>ocorrência(s) a cada</span>
                    <input
                      aria-label="Intervalo de recorrência"
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={config.recorrenciaIntervalo}
                      onChange={(e) =>
                        configurar(
                          "recorrenciaIntervalo",
                          Number(e.target.value),
                        )
                      }
                    />
                    <select
                      aria-label="Unidade de recorrência"
                      value={config.recorrenciaUnidade}
                      onChange={(e) =>
                        configurar(
                          "recorrenciaUnidade",
                          e.target
                            .value as ConfiguracaoEvento["recorrenciaUnidade"],
                        )
                      }
                    >
                      {["Meses", "Dias", "Anos", "Ano Civil"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </fieldset>
              )}
              <div className="pl-col-12 pl-parentesco-block">
                <label>
                  <span>
                    Exige Parentesco? <em>*</em>
                  </span>
                  <select
                    value={String(evento.parentesco)}
                    onChange={(e) =>
                      mudar("parentesco", e.target.value === "true")
                    }
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </label>
                {evento.parentesco && (
                  <fieldset className="pl-parentesco">
                    <legend>Graus de Parentesco Autorizados no Sistema</legend>
                    <p>Marque os permitidos para esta licença:</p>
                    <div>
                      {GRAUS_PARENTESCO.map((g) => (
                        <button
                          type="button"
                          key={g}
                          aria-pressed={config.grausParentesco.includes(g)}
                          onClick={() =>
                            configurar(
                              "grausParentesco",
                              config.grausParentesco.includes(g)
                                ? config.grausParentesco.filter((v) => v !== g)
                                : [...config.grausParentesco, g],
                            )
                          }
                        >
                          {config.grausParentesco.includes(g) && (
                            <i className="pi pi-check" aria-hidden="true" />
                          )}
                          {g}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            </div>
          </Secao>
          <Secao id="pl-documentacao" icone="pi-paperclip" titulo="Documentação Comprobatória" descricao="Defina se o servidor precisará anexar documentos para validar a ocorrência.">
            <fieldset className="pl-documentacao">
              <legend>Exigência de Documentos <em>*</em></legend>
              <div className="pl-radio-options">
                {[true, false].map(valor => <label key={String(valor)}>
                  <input type="radio" name="documentosObrigatorios" checked={(config.documentosObrigatorios ?? false) === valor} onChange={() => configurar("documentosObrigatorios", valor)}/>
                  {valor ? "Sim, obrigatório" : "Não é obrigatório"}
                </label>)}
              </div>
            </fieldset>
          </Secao>
        </div>
        <div
          role="tabpanel"
          id="pl-painel-financeiros"
          aria-labelledby="pl-aba-financeiros"
          hidden={aba !== "financeiros"}
        >
          <Secao
            id="pl-financeiros"
            icone="pi-wallet"
            titulo="Efeitos financeiros por tipo de vínculo"
            descricao="Configure o tratamento financeiro para cada tipo de vínculo selecionado."
          >
            {!evento.vinculos.length && (
              <p className="pl-finance-empty">
                Selecione ao menos um tipo de vínculo na seção 2 para configurar
                os efeitos financeiros correspondentes.
              </p>
            )}
            {evento.vinculos.map((vinculo) => {
              const efeito =
                config.efeitosFinanceiros?.[vinculo] ?? efeitoInicial(vinculo);
              const nome =
                OPCOES_VINCULOS.find((o) => o.value === vinculo)?.label ??
                vinculo;
              const ilustrativo =
                !original?.configuracao?.efeitosFinanceiros?.[vinculo] &&
                ["Efetivo", "Temporário"].includes(vinculo);
              return (
                <section
                  key={vinculo}
                  className="pl-finance-card"
                  aria-label={`Efeitos financeiros: ${nome}`}
                >
                  <header>
                    <h3>{nome}</h3>
                    {ilustrativo && <span>Exemplo ilustrativo</span>}
                  </header>
                  <div className="pl-finance-grid">
                    <fieldset>
                      <legend>
                        Gera ônus remuneratório para o órgão de origem? *
                      </legend>
                      <div className="pl-radio-options">
                        {[true, false].map((valor) => (
                          <label key={String(valor)}>
                            <input
                              type="radio"
                              name={`onus-${vinculo}`}
                              checked={efeito.geraOnus === valor}
                              onChange={() =>
                                mudarEfeito(vinculo, { geraOnus: valor })
                              }
                            />
                            {valor ? "Sim" : "Não"}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>Suspende a remuneração do servidor? *</legend>
                      <div className="pl-radio-options">
                        {[true, false].map((valor) => (
                          <label key={String(valor)}>
                            <input
                              type="radio"
                              name={`suspende-${vinculo}`}
                              checked={efeito.suspendeRemuneracao === valor}
                              onChange={() =>
                                mudarEfeito(vinculo, {
                                  suspendeRemuneracao: valor,
                                  diaInicioSuspensao: valor
                                    ? (efeito.diaInicioSuspensao ?? 1)
                                    : null,
                                })
                              }
                            />
                            {valor ? "Sim" : "Não"}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  {efeito.suspendeRemuneracao && (
                    <label className="pl-finance-dia">
                      A partir de qual dia da ocorrência a remuneração será
                      suspensa? *
                      <input
                        type="number"
                        min={1}
                        step={1}
                        required
                        value={efeito.diaInicioSuspensao ?? ""}
                        onChange={(e) =>
                          mudarEfeito(vinculo, {
                            diaInicioSuspensao:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                      <small>
                        Informe o primeiro dia da ocorrência em que a
                        remuneração deixa de ser paga.
                      </small>
                    </label>
                  )}
                </section>
              );
            })}
            <p className="pl-finance-note">
              <i className="pi pi-info-circle" aria-hidden="true" />
              <span>
                “Gerar ônus para o órgão de origem” e “suspender a remuneração
                do servidor” são regras diferentes. A ausência de ônus para o
                órgão de origem não significa, por si só, que o servidor ficará
                sem remuneração.
              </span>
            </p>
          </Secao>
        </div>
        </fieldset>
        {erro && (
          <p className="v2v-error" role="alert">
            {erro}
          </p>
        )}
        <div className="v2v-form-actions pl-config-actions">
          <button
            type="button"
            className="v2v-secondary"
            onClick={() => navigate(BASE)}
          >
            <i className="pi pi-arrow-left" aria-hidden="true" />
            Voltar
          </button>
          {!visualizar && aba === "dados" && <button type="button" className="v2v-primary" onClick={avancar}>
            Avançar <i className="pi pi-arrow-right" aria-hidden="true" />
          </button>}
          {!visualizar && aba === "financeiros" && <button type="submit" className="v2v-primary">
            <i className="pi pi-check" aria-hidden="true" />
            Salvar e Publicar
          </button>}
        </div>
      </form>
    </Ambiente>
  );
}
