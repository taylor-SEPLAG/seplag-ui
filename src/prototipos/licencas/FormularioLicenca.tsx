import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Ambiente } from "./AmbienteLicencas";
import {
  BASE_LICENCAS as BASE,
  CATEGORIAS,
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
} from "./model";

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
}: {
  clonar?: boolean;
}) {
  const { id } = useParams(),
    navigate = useNavigate();
  const [original] = useState(() =>
    id ? carregarEventos().find((e) => e.id === id) : undefined,
  );
  const [evento, setEvento] = useState<EventoLicenca>(() =>
    original
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
        },
  );
  const [config, setConfig] = useState(() => configuracaoDoEvento(evento));
  const [erro, setErro] = useState("");
  const titulo = clonar
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
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const recorrencia = config.travaRecorrencia
      ? `${config.recorrenciaQuantidade}x / ${config.recorrenciaIntervalo} ${config.recorrenciaUnidade}`
      : "";
    const duracao = config.semLimite
      ? "Sem limite"
      : config.abrangencias.length === 1 &&
          config.abrangencias[0] === "Por Horas"
        ? "Por horas"
        : config.contagem;
    try {
      salvarEvento(
        {
          ...evento,
          configuracao: {
            ...config,
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
      <div className="pl-form-heading">
        <p className="v2v-description">
          Cadastro e definição de regras operacionais para lançamento no SIGEP.
        </p>
      </div>
      {clonar && (
        <p className="v2v-description">
          Nova parametrização baseada em {original?.codigo}.
        </p>
      )}
      <form onSubmit={salvar} className="v2v-form pl-config-form">
        <Secao
          id="pl-identificacao"
          icone="pi-file"
          titulo="1. Identificação do Evento e Vigência"
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
                Nome do Evento (Exibido no Lançamento) <em>*</em>
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
            <label className="pl-col-4">
              <span>
                Categoria (Tabela de Domínio) <em>*</em>
              </span>
              <select
                required
                value={evento.categoria}
                onChange={(e) => mudar("categoria", e.target.value)}
              >
                <option value="">Selecione...</option>
                {CATEGORIAS.map((c, i) => (
                  <option key={c} value={c}>
                    {i + 1} - {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="pl-col-4">
              <span>
                Fundamento Legal <em>*</em>
              </span>
              <input
                required
                maxLength={500}
                value={config.fundamentoLegal}
                onChange={(e) => configurar("fundamentoLegal", e.target.value)}
              />
            </label>
            <label className="pl-col-4">
              <span>
                Natureza <em>*</em>
              </span>
              <select
                value={evento.natureza}
                onChange={(e) =>
                  mudar("natureza", e.target.value as EventoLicenca["natureza"])
                }
              >
                {NATUREZAS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="pl-col-12">
              <span>Descrição Detalhada / Orientação Operacional</span>
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
          titulo="2. Aplicabilidade por Tipo de Vínculo Funcional"
          descricao="Selecione um ou mais tipos de vínculo aos quais a parametrização se aplica."
        >
          <SelecaoMultipla
            titulo="Tipos de Vínculo"
            opcoes={OPCOES_VINCULOS}
            valores={evento.vinculos}
            alterar={(v) => mudar("vinculos", v)}
            pesquisavel
          />
        </Secao>
        <Secao
          id="pl-regras"
          icone="pi-sliders-h"
          titulo="3. Regras de Duração, Limites e Recorrência"
          descricao="Defina a duração, a abrangência e as condições para o lançamento."
        >
          <div className="pl-config-grid">
            <div className="pl-col-3">
              <label>
                <span>
                  Dias Máximos Permitidos <em>*</em>
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required={!config.semLimite}
                  disabled={config.semLimite}
                  value={config.semLimite ? "" : evento.quantidade}
                  placeholder={config.semLimite ? "Sem Limite" : "Ex.: 8"}
                  onChange={(e) => mudar("quantidade", Number(e.target.value))}
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
            <label className="pl-col-3">
              <span>
                Tipo de Contagem <em>*</em>
              </span>
              <select
                value={config.contagem}
                onChange={(e) =>
                  configurar(
                    "contagem",
                    e.target.value as ConfiguracaoEvento["contagem"],
                  )
                }
              >
                <option value="Dias corridos">Dias Corridos</option>
                <option value="Dias úteis">Dias Úteis</option>
              </select>
            </label>
            <div className="pl-col-3">
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
            <label className="pl-col-3">
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
                      configurar("recorrenciaIntervalo", Number(e.target.value))
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
          <button type="submit" className="v2v-primary">
            <i className="pi pi-check" aria-hidden="true" />
            Salvar e Publicar
          </button>
        </div>
      </form>

    </Ambiente>
  );
}
