import { useState } from "react";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { useNavigate } from "react-router-dom";
import {
  CALENDARIO_CRONOGRAMA_PATH,
  dataBR,
  diaCuiaba,
  diasCalendario,
  eventosDoDia,
  eventosDoMes,
  mudarMes,
  normalizar,
  rotuloMes,
  situacaoEvento,
  type CalendarioFonte,
  type EventoCronograma,
} from "./model";
import "./cronograma.css";

const HOME = "/prototipos/sigep/pagina-inicial";
// Paleta de apresentação; mantém intactas a categoria e a situação da fonte.
function aparenciaTipo(cor: string) {
  if (cor === "#2155d6")
    return { cor: "#0875E1", borda: "#0056B8", fundo: "#F3F7FF" };
  if (cor === "#ec5800")
    return { cor: "#F97300", borda: "#D65F00", fundo: "#FFF4EA" };
  return { cor, borda: cor, fundo: `${cor}0d` };
}
export function CalendarioContent({
  calendario,
  agora = new Date(),
  homePath = HOME,
  cronogramaPath = CALENDARIO_CRONOGRAMA_PATH,
}: {
  calendario: CalendarioFonte;
  agora?: Date;
  homePath?: string;
  cronogramaPath?: string;
}) {
  const navigate = useNavigate();
  const hoje = diaCuiaba(agora);
  const [mesEscolhido, setMes] = useState<string | null>(null);
  const [diaEscolhido, setDia] = useState<string | null>(null);
  const mes = mesEscolhido ?? hoje.slice(0, 7);
  const dia = diaEscolhido ?? hoje;
  const [modo, setModo] = useState<"mes" | "lista">("mes");
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const filtro = normalizar(busca.trim());
  const filtrados = calendario.eventos.filter(
    (evento) =>
      (!tipo || evento.tipoId === tipo) &&
      normalizar(`${evento.nome} ${evento.descricao}`).includes(filtro),
  );
  const noMes = eventosDoMes(filtrados, mes);
  const disponivel = eventosDoMes(calendario.eventos, mes).length > 0;
  const selecionados = eventosDoDia(filtrados, dia);
  const dias = diasCalendario(mes);
  const navegarMes = (deslocamento: number) => {
    const proximo = mudarMes(mes, deslocamento);
    setMes(proximo);
    setDia(`${proximo}-01`);
  };
  const selecionar = (data: string) => {
    setDia(data);
    setMes(data.slice(0, 7));
    setModo("mes");
  };
  const irParaEvento = (evento: EventoCronograma) =>
    selecionar(evento.inicio.startsWith(mes) ? evento.inicio : `${mes}-01`);

  return (
    <main className="sigep-cronograma-page">
      <BreadcrumbSeplag
        className="sigep-cronograma-breadcrumb"
        divided
        homeTo={homePath}
        items={[
          { label: "Página Inicial", to: homePath },
          { label: "Cronograma", to: cronogramaPath },
        ]}
      />
      <div className="sigep-cronograma-topo">
        <div className="sigep-cronograma-voltar">
          <BotaoVoltarSeplag
            type="button"
            aria-label="Voltar"
            className="sigep-cronograma-voltar-acao"
            unstyled
            raised={false}
            onClick={() => navigate(homePath)}
          />
        </div>
        <header className="sigep-cronograma-header">
          <div className="sigep-cronograma-heading">
            <span>
              <i className="pi pi-calendar" aria-hidden="true" />
            </span>
            <div>
              <h1>Cronograma da Folha</h1>
              <p>{calendario.titulo}</p>
            </div>
          </div>
          <div className="sigep-cronograma-header-acoes">
            <BotaoSeplag
              type="button"
              label="Configurar cronograma"
              icon="pi pi-cog"
              onClick={() =>
                navigate(
                  cronogramaPath.startsWith("/prototipos/sigep/folha/")
                    ? "/prototipos/folha/cronograma"
                    : "/prototipos/sigep/cronograma/configurar",
                )
              }
            />
          </div>
        </header>
      </div>
      <section
        className="sigep-cronograma-filtros"
        aria-label="Filtros do cronograma"
      >
        <label>
          Buscar evento
          <input
            type="search"
            placeholder="Buscar por nome ou descrição"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>
        <label>
          Tipo de folha
          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          >
            <option value="">Todas as folhas</option>
            {calendario.tipos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
        <button
          className="sigep-cronograma-limpar"
          type="button"
          aria-label="Limpar filtro"
          onClick={() => {
            setBusca("");
            setTipo("");
          }}
        >
          <i className="pi pi-refresh" aria-hidden="true" />{" "}
          <span>Limpar filtro</span>
        </button>
      </section>
      <section
        className="sigep-cronograma-painel"
        aria-label="Calendário de Cronograma"
      >
        <div className="sigep-cronograma-toolbar">
          <div className="sigep-cronograma-meses">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => navegarMes(-1)}
            >
              <i className="pi pi-chevron-left" aria-hidden="true" />
            </button>
            <h2 aria-live="polite">{rotuloMes(mes)}</h2>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => navegarMes(1)}
            >
              <i className="pi pi-chevron-right" aria-hidden="true" />
            </button>
          </div>
          <div className="sigep-cronograma-modos" aria-label="Visualização">
            <button
              type="button"
              aria-pressed={modo === "mes"}
              onClick={() => setModo("mes")}
            >
              <i className="pi pi-calendar" aria-hidden="true" /> Mês
            </button>
            <button
              type="button"
              aria-pressed={modo === "lista"}
              onClick={() => setModo("lista")}
            >
              <i className="pi pi-list" aria-hidden="true" /> Lista
            </button>
          </div>
        </div>
        <div className="sigep-cronograma-legenda" aria-label="Tipos de folha">
          {calendario.tipos.map((item) => (
            <span key={item.id}>
              <i
                style={{ background: aparenciaTipo(item.cor).cor }}
                aria-hidden="true"
              />
              {item.nome}
            </span>
          ))}
        </div>
        {!disponivel && (
          <p className="sigep-cronograma-vazio" role="status">
            Nenhum cronograma disponível para este período.
          </p>
        )}
        {disponivel && !noMes.length && (
          <p className="sigep-cronograma-vazio" role="status">
            Nenhum evento encontrado para os filtros selecionados.
          </p>
        )}
        {calendario.semData > 0 && (
          <p className="sigep-cronograma-aviso">
            {calendario.semData} evento(s) sem período válido na configuração da
            folha. Não é possível posicioná-los no calendário.
          </p>
        )}
        {modo === "mes" ? (
          <div className="sigep-cronograma-scroll">
            <table
              className={`sigep-cronograma-calendario${dias.length === 42 ? " is-seis-semanas" : ""}`}
              aria-label={rotuloMes(mes)}
            >
              <thead>
                <tr>
                  {[
                    "Domingo",
                    "Segunda",
                    "Terça",
                    "Quarta",
                    "Quinta",
                    "Sexta",
                    "Sábado",
                  ].map((nome) => (
                    <th key={nome} scope="col">
                      <span className="sigep-cronograma-semana-longa">
                        {nome}
                      </span>
                      <abbr
                        className="sigep-cronograma-semana-curta"
                        title={nome}
                      >
                        {nome.slice(0, 3)}
                      </abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: dias.length / 7 }, (_, semana) => (
                  <tr key={semana}>
                    {dias.slice(semana * 7, semana * 7 + 7).map((data) => {
                      const eventos = eventosDoDia(filtrados, data);
                      return (
                        <td
                          key={data}
                          className={`${data.startsWith(mes) ? "" : "is-outro-mes"} ${data === dia ? "is-selecionado" : ""} ${data === hoje ? "is-hoje" : ""}`}
                        >
                          <button
                            type="button"
                            className="sigep-cronograma-dia"
                            aria-label={`${dataBR(data)} — ${eventos.length} eventos`}
                            aria-pressed={data === dia}
                            aria-current={data === hoje ? "date" : undefined}
                            onClick={() => selecionar(data)}
                          >
                            <span className="sigep-cronograma-numero">
                              {Number(data.slice(8))}
                            </span>
                            {eventos.slice(0, 2).map((evento) => (
                              <span
                                className="sigep-cronograma-marco"
                                key={evento.id}
                                style={{
                                  borderLeftColor: aparenciaTipo(evento.cor)
                                    .borda,
                                  backgroundColor: aparenciaTipo(evento.cor)
                                    .cor,
                                  color: "#fff",
                                }}
                                title={`${evento.tipo}: ${evento.nome} — ${situacaoEvento(evento, agora).nome}`}
                              >
                                <i
                                  style={{ background: "#fff" }}
                                  aria-hidden="true"
                                />
                                <span>{evento.nome}</span>
                              </span>
                            ))}
                            {eventos.length > 2 && (
                              <span className="sigep-cronograma-mais">
                                +{eventos.length - 2}
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sigep-cronograma-lista">
            {noMes.map((evento) => (
              <button
                type="button"
                className="sigep-cronograma-lista-evento"
                key={evento.id}
                onClick={() => irParaEvento(evento)}
              >
                <span className="sigep-cronograma-lista-data">
                  {dataBR(evento.inicio)}
                  <small>{evento.horario || "Horário não informado"}</small>
                </span>
                <span className="sigep-cronograma-lista-nome">
                  <strong>{evento.nome}</strong>
                  <small style={{ color: aparenciaTipo(evento.cor).cor }}>
                    {evento.tipo}
                  </small>
                </span>
                <i className="pi pi-chevron-right" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>
      {modo === "mes" && (
        <section
          className="sigep-cronograma-detalhes"
          aria-label="Eventos da data selecionada"
          aria-live="polite"
        >
          <h2>
            <span>
              <i className="pi pi-calendar" aria-hidden="true" /> Eventos de{" "}
              {dataBR(dia)}
            </span>
            <span className="sigep-cronograma-contagem">
              {selecionados.length} eventos
            </span>
          </h2>
          <div
            className="sigep-cronograma-detalhes-conteudo"
            tabIndex={0}
            aria-label="Resumo dos eventos do dia"
          >
            {!selecionados.length ? (
              <p className="sigep-cronograma-vazio">
                Nenhum evento programado para esta data.
              </p>
            ) : (
              selecionados.map((evento) => (
                <article
                  key={evento.id}
                  className="sigep-cronograma-evento"
                  style={{
                    borderLeftColor: aparenciaTipo(evento.cor).cor,
                    backgroundColor: aparenciaTipo(evento.cor).fundo,
                  }}
                >
                  <span
                    className="sigep-cronograma-tipo"
                    style={{ color: aparenciaTipo(evento.cor).cor }}
                  >
                    <i className="pi pi-circle-fill" aria-hidden="true" />
                    {evento.tipo}
                  </span>
                  <div className="sigep-cronograma-evento-nome">
                    <h3 title={evento.nome}>{evento.nome}</h3>
                    {(evento.observacao ||
                      evento.nome !== evento.descricao) && (
                      <details className="sigep-cronograma-complementos">
                        <summary>Informações complementares</summary>
                        {evento.nome !== evento.descricao && (
                          <p>{evento.descricao}</p>
                        )}
                        {evento.observacao && <p>{evento.observacao}</p>}
                        <p>Competência: {rotuloMes(evento.competencia)}</p>
                      </details>
                    )}
                  </div>
                  <span className="sigep-cronograma-periodo">
                    <i className="pi pi-calendar" aria-hidden="true" />
                    {dataBR(evento.inicio)}
                    {evento.fim !== evento.inicio && ` a ${dataBR(evento.fim)}`}
                  </span>
                  <span className="sigep-cronograma-horario">
                    <i className="pi pi-clock" aria-hidden="true" />
                    {evento.horario || "Não informado"}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}
