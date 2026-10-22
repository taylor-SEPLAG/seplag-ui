import { useRef, useState, type ReactNode, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CardSeplag } from "../../componentes/Card";
import {
  AnexarDocumentoSeplag,
  type ArquivoAnexadoSeplag,
} from "../../componentes/AnexarDocumento";
import { abrirDocumento, lerDocumento } from "./documentosSolicitacao";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import {
  carregarEventos,
  configuracaoDoEvento,
  GRAUS_PARENTESCO,
} from "../licencas/model";
import {
  GESTAO_LICENCAS_PATH,
  TITULO_GESTAO_LICENCAS,
  type RegistroLicenca,
} from "./model";
import {
  buscarServidores,
  carregarSolicitacoes,
  carregarGestaoLicencas,
  diasPeriodo,
  STORAGE_SOLICITACOES,
  totalMinutos,
  type SolicitacaoLocal,
} from "./solicitacaoModel";
import "../vinculos/vinculoV2.css";
import "./gestaoLicencas.css";
import "./novaSolicitacao.css";

function Secao({
  titulo,
  icone,
  children,
  className = "",
}: {
  titulo: string;
  icone: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`v2v-panel v2v-form-section ${className}`}>
      <header className="v2v-section-header">
        <i className={`pi ${icone}`} aria-hidden="true" />
        <h2>{titulo}</h2>
      </header>
      <div className="v2v-section-body">{children}</div>
    </section>
  );
}
export function NovaSolicitacaoContent({
  registro,
  editar = false,
}: { registro?: RegistroLicenca; editar?: boolean } = {}) {
  const visualizar = Boolean(registro) && !editar;
  const navigate = useNavigate();
  const [parametrizacoes] = useState(carregarEventos);
  const [servidor, setServidor] = useState<SolicitacaoLocal | null>(
    registro
      ? {
          id: registro.matricula,
          nome: registro.nome,
          matricula: registro.matricula,
          cpf: registro.solicitacao?.cpf || "Não informado",
          vinculos: [
            {
              numero: registro.vinculo,
              orgao: registro.orgao,
              tipo: registro.tipoVinculo,
              cargo: registro.cargo,
              lotacao: registro.lotacao,
              jornada: "Não informada",
            },
          ],
        }
      : null,
  );
  const [busca, setBusca] = useState(
    registro
      ? `${registro.matricula}/${registro.vinculo} - ${registro.nome}`
      : "",
  );
  const [buscaAberta, setBuscaAberta] = useState(false);
  const opcoes = buscarServidores("").flatMap((servidor) =>
    servidor.vinculos.map((vinculo) => ({
      servidor,
      vinculo,
      rotulo: servidor.matricula + "/" + vinculo.numero + " - " + servidor.nome,
    })),
  );
  const termo = busca
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const resultados = opcoes.filter(
    (o) =>
      !termo ||
      [o.rotulo, o.servidor.cpf, o.servidor.cpf.replace(/\D/g, "")].some(
        (valor) =>
          valor
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(termo),
      ),
  );
  const [vinculoSelecionado, setVinculoSelecionado] = useState<number | null>(
    registro?.vinculo ?? null,
  );
  const vinculoAtual = servidor?.vinculos.find(
    (v) => v.numero === vinculoSelecionado,
  );
  const [eventoId, setEventoId] = useState(
    registro?.solicitacao?.eventoId ||
      parametrizacoes.find(
        (e) =>
          e.nome === registro?.tipo ||
          (registro?.tipo.startsWith("LTS") && e.id === "lic-101") ||
          (registro?.tipo === "Luto / Falecimento" && e.id === "lic-135"),
      )?.id ||
      "",
  );
  const [inicio, setInicio] = useState(registro?.inicio || ""),
    [fimInformado, setFim] = useState(registro?.fim || "");
  const [horaInicio, setHoraInicio] = useState(
      registro?.solicitacao?.horaInicio || "08:00",
    ),
    [horaFim, setHoraFim] = useState(registro?.solicitacao?.horaFim || "12:00");
  const [parentesco, setParentesco] = useState(
      registro?.solicitacao?.parentesco || "",
    ),
    [observacao, setObservacao] = useState(
      registro?.solicitacao?.observacao || "",
    );
  const [erro, setErro] = useState("");
  const [documentos, setDocumentos] = useState<ArquivoAnexadoSeplag[]>(
    registro?.solicitacao?.documentos || [],
  );
  const [lendoDocumentos, setLendoDocumentos] = useState(false);
  const lendoRef = useRef(false);
  async function anexarArquivos(files: File[]) {
    if (visualizar || lendoRef.current || !files.length) return;
    lendoRef.current = true;
    setLendoDocumentos(true);
    setErro("");
    try {
      const novos = await Promise.all(files.map(lerDocumento));
      setDocumentos((atuais) => [...atuais, ...novos]);
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível anexar o documento.",
      );
    } finally {
      lendoRef.current = false;
      setLendoDocumentos(false);
    }
  }
  const evento = parametrizacoes.find((e) => e.id === eventoId);
  const config = evento ? configuracaoDoEvento(evento) : null;
  const porHoras = visualizar
    ? registro?.abrangencia === "POR HORAS"
    : evento?.duracao === "Por horas";
  const fimSomenteLeitura = Boolean(
    evento && !porHoras && !config?.semLimite && evento.quantidade > 0,
  );
  let fim = fimInformado;
  if (fimSomenteLeitura && !visualizar) {
    fim = "";
    if (inicio && evento) {
      const data = new Date(inicio + "T00:00:00Z");
      let restantes = evento.quantidade;
      while (restantes > 0) {
        if (
          config?.contagem !== "Dias úteis" ||
          ![0, 6].includes(data.getUTCDay())
        )
          restantes--;
        if (restantes > 0) data.setUTCDate(data.getUTCDate() + 1);
      }
      fim = data.toISOString().slice(0, 10);
    }
  }
  const minutos = totalMinutos(horaInicio, horaFim);
  const totalHoras = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")} horas`;
  const dias = visualizar
    ? registro!.dias
    : diasPeriodo(inicio, fim, config?.contagem === "Dias úteis");
  const bloqueioRecorrencia = !registro && servidor?.matricula === "257812";
  function salvar(e: FormEvent) {
    e.preventDefault();
    if (visualizar) return;
    if (bloqueioRecorrencia) return;
    if (lendoDocumentos) return;
    setErro("");
    if (!servidor || vinculoSelecionado === null)
      return setErro("Selecione o servidor e um vínculo funcional.");
    if (!evento || evento.situacao !== "Ativo")
      return setErro("Selecione uma parametrização ativa.");
    if (config?.documentosObrigatorios && !documentos.length)
      return setErro("Anexe pelo menos um documento comprobatório.");
    if (!inicio || !fim || fim < inicio)
      return setErro(
        "Informe um período válido. O término deve ser igual ou posterior ao início.",
      );
    if (porHoras && (inicio !== fim || !minutos))
      return setErro(
        "Para lançamento por horas, informe o mesmo dia e horário de término posterior ao início.",
      );
    if (evento.parentesco && !parentesco)
      return setErro("Selecione o grau de parentesco.");
    if (
      (config?.inicioVigencia && inicio < config.inicioVigencia) ||
      (config?.fimVigencia && fim > config.fimVigencia)
    )
      return setErro(
        "O período deve estar dentro da vigência da parametrização.",
      );
    if (!porHoras && !config?.semLimite && dias > evento.quantidade)
      return setErro(
        `O período excede o limite de ${evento.quantidade} dias da parametrização.`,
      );
    const vinculos = servidor.vinculos.filter(
      (v) => v.numero === vinculoSelecionado,
    );
    if (
      vinculos.some(
        (v) =>
          !evento.vinculos.includes(
            v.tipo === "Contrato Temporário" ? "Temporário" : v.tipo,
          ),
      )
    )
      return setErro(
        "A parametrização não autoriza o tipo de vínculo selecionado.",
      );
    const novos: RegistroLicenca[] = vinculos.map((v) => ({
      id: editar && registro ? registro.id : crypto.randomUUID(),
      matricula: servidor.matricula,
      vinculo: v.numero,
      tipoVinculo: v.tipo,
      orgao: v.orgao,
      lotacao: v.lotacao,
      nome: servidor.nome,
      cargo: v.cargo,
      chefia: editar && registro ? registro.chefia : false,
      inicio,
      fim,
      tipo: evento.nome,
      categoria: evento.natureza,
      dias,
      abrangencia: porHoras ? "POR HORAS" : "INTEGRAL",
      origem: editar && registro ? registro.origem : "SIGEP",
      situacao: editar && registro ? registro.situacao : "Em andamento",
      solicitacao: {
        eventoId: evento.id,
        cpf: servidor.cpf,
        parentesco: evento.parentesco ? parentesco : "",
        observacao,
        documentos,
        ...(porHoras ? { horaInicio, horaFim, totalHoras } : {}),
      },
    }));
    try {
      localStorage.setItem(
        STORAGE_SOLICITACOES,
        JSON.stringify([
          ...novos,
          ...carregarSolicitacoes().filter(
            (r) => !novos.some((n) => n.id === r.id),
          ),
        ]),
      );
      navigate(GESTAO_LICENCAS_PATH, { state: { solicitacaoSalva: true } });
    } catch {
      setErro(
        "Não foi possível salvar o lançamento neste navegador. Tente novamente.",
      );
    }
  }
  return (
    <form className="gl-solicitacao" onSubmit={salvar}>
      <fieldset
        disabled={visualizar}
        className="gl-solicitacao-fields"
        aria-label={
          visualizar ? "Solicitação em modo de leitura" : "Dados da solicitação"
        }
      >
        <Secao
          titulo="Identificação do Servidor e Seleção de Vínculo Funcional"
          icone="pi-user"
          className="v2v-server-section"
        >
          <div
            className="gl-busca-servidor"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget))
                setBuscaAberta(false);
            }}
          >
            <label>
              Buscar servidor
              <input
                value={busca}
                disabled={editar}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={buscaAberta}
                aria-controls="gl-servidores-encontrados"
                onFocus={() => setBuscaAberta(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setBuscaAberta(false);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setBuscaAberta(true);
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLButtonElement>(
                          "#gl-servidores-encontrados button",
                        )
                        ?.focus(),
                    );
                  }
                }}
                placeholder="Buscar servidor por matrícula, CPF ou nome..."
                onChange={(e) => {
                  setBusca(e.target.value);
                  setBuscaAberta(true);
                  setServidor(null);
                  setVinculoSelecionado(null);
                }}
              />
            </label>
            <button
              type="button"
              className="v2v-secondary gl-limpar-servidor"
              disabled={editar}
              onClick={() => {
                setServidor(null);
                setVinculoSelecionado(null);
                setBusca("");
                setBuscaAberta(false);
              }}
            >
              ✕ Limpar
            </button>
            {buscaAberta && (
              <div
                id="gl-servidores-encontrados"
                className="gl-resultados"
                role="listbox"
                aria-label="Servidores encontrados"
              >
                {resultados.map(({ servidor: s, vinculo, rotulo }, indice) => (
                  <button
                    key={`${s.matricula}/${vinculo.numero}`}
                    type="button"
                    role="option"
                    aria-selected={
                      servidor?.matricula === s.matricula &&
                      vinculoSelecionado === vinculo.numero
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setBuscaAberta(false);
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const opcoes =
                          e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                            "button",
                          );
                        opcoes?.[
                          (indice +
                            (e.key === "ArrowDown" ? 1 : -1) +
                            resultados.length) %
                            resultados.length
                        ]?.focus();
                      }
                    }}
                    className="v2v-secondary"
                    onClick={() => {
                      setServidor(s);
                      setVinculoSelecionado(vinculo.numero);
                      setBusca(rotulo);
                      setBuscaAberta(false);
                    }}
                  >
                    {rotulo}
                  </button>
                ))}
                {!resultados.length && (
                  <p role="status">Nenhum servidor encontrado.</p>
                )}
              </div>
            )}
          </div>
          {servidor && (
            <>
              {vinculoAtual && (
                <section
                  className="gl-servidor-card"
                  aria-label="Dados do servidor e vínculo selecionado"
                >
                  <header>
                    <strong>{servidor.nome}</strong>
                    <span className="gl-servidor-identificacao">
                      Matrícula: <b>{servidor.matricula}</b>
                    </span>
                    <span className="gl-servidor-identificacao">
                      Vínculo: <b>{vinculoAtual.numero}</b>
                    </span>
                  </header>
                  <dl>
                    <div>
                      <dt>Órgão/Unidade de Lotação</dt>
                      <dd>{vinculoAtual.orgao} / {vinculoAtual.lotacao}</dd>
                    </div>
                    <div>
                      <dt>Cargo</dt>
                      <dd>{vinculoAtual.cargo}</dd>
                    </div>
                    <div>
                      <dt>Jornada</dt>
                      <dd>{vinculoAtual.jornada}</dd>
                    </div>
                    <div>
                      <dt>Tipo de vínculo</dt>
                      <dd>
                        <span className="gl-pill gl-tipo">
                          {vinculoAtual.tipo}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </section>
              )}
              {bloqueioRecorrencia && (
                <div className="gl-bloqueio-recorrencia" role="alert">
                  <i className="pi pi-ban" aria-hidden="true" />
                  <div>
                    <strong>Bloqueio de Lançamento: Janela de Recorrência Excedida</strong>
                    <p>
                      O servidor já possui o lançamento da ocorrência <strong>"3 - Doação Voluntária de Sangue"</strong> realizado em <strong>15/05/2026</strong>. O limite parametrizado de <strong>1x a cada 12 meses</strong> foi atingido e uma nova concessão só será permitida a partir de <strong>16/05/2027</strong>.
                    </p>
                  </div>
                </div>
              )}
              {servidor.matricula === "241244" && !visualizar && (
                <div
                  className="prototype-vinculo-ativo-alert gl-aviso-ferias"
                  role="status"
                >
                  <i
                    className="pi pi-exclamation-triangle"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Conflito com Férias Agendadas</strong>
                    <br />O servidor selecionado possui férias agendadas no
                    período de 10/12/2026 a 20/12/2026 (Vínculo 1 - SEPLAG/MT).{" "}
                    {inicio &&
                    fim &&
                    inicio <= "2026-12-20" &&
                    fim >= "2026-12-10"
                      ? "A licença informada coincide com este período. Verifique a necessidade de sobreposição ou altere as datas."
                      : "Ao informar o período da licença, verifique se há sobreposição com as férias agendadas."}
                  </span>
                </div>
              )}
            </>
          )}
        </Secao>
        <Secao
          titulo="Dados da Licença, Afastamento ou Ausência"
          icone="pi-calendar"
        >
          <div className="gl-solicitacao-grid">
            <label className="gl-span-full">
              Tipo de Licença, Afastamento ou Ausência *
              <select
                required
                value={eventoId}
                onChange={(e) => {
                  setEventoId(e.target.value);
                  setParentesco("");
                  setErro("");
                }}
              >
                <option value="">
                  {visualizar ? registro?.tipo : "Selecione..."}
                </option>
                {visualizar && eventoId && (
                  <option value={eventoId}>{registro?.tipo}</option>
                )}
                {!visualizar &&
                  parametrizacoes.map((e) => (
                    <option
                      key={e.id}
                      value={e.id}
                      disabled={e.situacao !== "Ativo"}
                    >
                      {e.codigo} - {e.nome} ({e.duracao}
                      {e.situacao !== "Ativo" ? " · Inativo" : ""})
                    </option>
                  ))}
              </select>
            </label>
            {(evento?.parentesco || (visualizar && parentesco)) && (
              <label className="gl-span-full">
                Grau de Parentesco do Familiar *
                <select
                  required
                  value={parentesco}
                  onChange={(e) => setParentesco(e.target.value)}
                >
                  <option value="">Selecione o familiar...</option>
                  {visualizar && parentesco && <option>{parentesco}</option>}
                  {!visualizar &&
                    (config?.grausParentesco.length
                      ? config.grausParentesco
                      : GRAUS_PARENTESCO
                    ).map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
            )}
            <div className="gl-periodo gl-span-full">
              <label>
                Data de Início *
                <input
                  type="date"
                  required
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </label>
              <label>
                Data de Término *
                <input
                  type="date"
                  required
                  min={inicio}
                  readOnly={fimSomenteLeitura}
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                />
              </label>
              <label>
                Quantidade de dias
                <input
                  type="number"
                  readOnly
                  value={inicio && fim && fim >= inicio ? dias : ""}
                />
              </label>
            </div>
            {porHoras && (
              <div className="gl-horas gl-span-full">
                <label>
                  Hora de Início *
                  <input
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </label>
                <label>
                  Hora de Término *
                  <input
                    type="time"
                    required
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </label>
                <label>
                  Total de Horas Abatidas
                  <input readOnly value={totalHoras} />
                </label>
              </div>
            )}
            {evento?.recorrencia && (
              <p className="v2v-notice gl-span-full">
                <i className="pi pi-info-circle" aria-hidden="true" />
                Recorrência configurada: {evento.recorrencia}. A conferência do
                histórico deve ser realizada antes do lançamento.
              </p>
            )}
            <label className="gl-span-full">
              Observação / Documento de Respaldo
              <textarea
                rows={3}
                placeholder="Informe o número do processo SIGADOC ou certidão de respaldo..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </label>
            {!visualizar && (
              <div className="gl-span-full">
                <span className="prototype-judicial-upload-label">
                  Documentos{" "}
                  {config?.documentosObrigatorios
                    ? "(obrigatório)"
                    : "(opcional)"}
                </span>
                <label
                  className="gl-upload-area"
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void anexarArquivos(Array.from(e.dataTransfer.files));
                  }}
                >
                  <input
                    className="gl-upload-input"
                    type="file"
                    aria-label="Escolher arquivo"
                    accept=".pdf,.doc,.docx"
                    multiple
                    disabled={lendoDocumentos}
                    onChange={(e) => {
                      void anexarArquivos(Array.from(e.target.files ?? []));
                      e.target.value = "";
                    }}
                  />
                  <span className="prototype-judicial-upload-button">
                    <i className="pi pi-upload" aria-hidden="true" />
                    Escolher arquivo
                  </span>
                  <span className="prototype-judicial-upload-prompt">
                    Arraste e solte o arquivo aqui ou clique para selecionar
                  </span>
                  <small>Formatos aceitos: PDF, DOC, DOCX (Máx. 10MB)</small>
                </label>
                <AnexarDocumentoSeplag
                  cols="12"
                  hideLabel
                  className="gl-upload-list"
                  multiple
                  arquivosBase64={documentos}
                  onRemoveArquivo={(_, indice) =>
                    setDocumentos((atuais) =>
                      atuais.filter((_, i) => i !== indice),
                    )
                  }
                  handleViewArquivo={(arquivo) => abrirDocumento(arquivo)}
                  onDownloadArquivo={(arquivo) => abrirDocumento(arquivo, true)}
                />
                {lendoDocumentos && (
                  <p role="status">Carregando documentos...</p>
                )}
              </div>
            )}
          </div>
        </Secao>
      </fieldset>
      {visualizar && (
        <AnexarDocumentoSeplag
          cols="12"
          label="Documentos anexados"
          arquivosBase64={documentos}
          handleViewArquivo={(arquivo) => abrirDocumento(arquivo)}
          onDownloadArquivo={(arquivo) => abrirDocumento(arquivo, true)}
        />
      )}
      {erro && (
        <p role="alert" className="v2v-error">
          {erro}
        </p>
      )}
      <div className="v2v-form-actions">
        <button
          type="button"
          className="v2v-secondary"
          onClick={() => navigate(GESTAO_LICENCAS_PATH)}
        >
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Voltar
        </button>
        {!visualizar && (
          <button
            type="submit"
            className="v2v-primary"
            disabled={lendoDocumentos || bloqueioRecorrencia}
          >
            <i className="pi pi-check" aria-hidden="true" />
            {editar ? "Salvar alterações" : "Efetivar Lançamento"}
          </button>
        )}
      </div>
    </form>
  );
}
export function NovaSolicitacaoLicencaPage({
  visualizar = false,
  editar = false,
}: {
  visualizar?: boolean;
  editar?: boolean;
}) {
  const { id } = useParams();
  const [registro] = useState(() =>
    visualizar || editar
      ? carregarGestaoLicencas().find((r) => r.id === id)
      : undefined,
  );
  const titulo = visualizar
    ? "Visualizar solicitação de licença"
    : editar
      ? "Editar solicitação de licença"
      : "Nova solicitação de licença";
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="prototype-page-content prototype-page-content--white v2v-shell gl-shell">
        <CardSeplag
          title={titulo}
          cols="12"
          cardHeaderClassNames="prototype-carreira-card v2v-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                {
                  label: "Direitos e Benefícios",
                  to: "/prototipos/sigep/direitos-beneficios",
                },
                { label: TITULO_GESTAO_LICENCAS, to: GESTAO_LICENCAS_PATH },
                { label: titulo },
              ]}
            />
          }
        >
          <div className="v2v-page gl-page">
            {(visualizar || editar) && !registro ? (
              <>
                <p role="alert">Solicitação não encontrada.</p>
                <a href={GESTAO_LICENCAS_PATH}>Voltar</a>
              </>
            ) : (
              <NovaSolicitacaoContent registro={registro} editar={editar} />
            )}
          </div>
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
