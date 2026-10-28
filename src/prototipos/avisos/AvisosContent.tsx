import { AnexarDocumentoSeplag } from "../../componentes/AnexarDocumento";
import { abrirDocumento } from "../gestaoLicencas/documentosSolicitacao";
import { NovoInformativoModal } from "./NovoInformativoModal";
import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { ModalMensagemSeplag } from "../../componentes/ModalMensagem";
import {
  AVISOS_PATH,
  HOME_PATH,
  categorias,
  categoriaAviso,
  filtrarAvisos,
  metaAviso,
  type Categoria,
  type Comunicado,
} from "./model";
import "../cronograma/cronograma.css";
import "./avisos.css";

const cores = (meta: (typeof categorias)[number]) =>
  ({
    "--aviso-cor": meta.cor,
    "--aviso-fundo": meta.fundo,
    "--aviso-icone-fundo": meta.iconeFundo,
    "--aviso-icone-cor": "iconeCor" in meta ? meta.iconeCor : meta.textoCor,
    "--aviso-texto-cor": meta.textoCor,
  }) as CSSProperties;

export function AvisosContent({
  avisos,
  homePath = HOME_PATH,
  avisosPath = AVISOS_PATH,
}: {
  avisos: Comunicado[];
  homePath?: string;
  avisosPath?: string;
}) {
  const navigate = useNavigate();
  const [novoAberto, setNovoAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("todos");
  const [leituraId, setLeituraId] = useState<number | null>(null);
  const leitura = avisos.find((aviso) => aviso.id === leituraId);
  const filtrados = filtrarAvisos(avisos, busca, categoria);
  const fechar = () => setLeituraId(null);
  return (
    <main className="sigep-cronograma-page sigep-avisos-page">
      <BreadcrumbSeplag
        className="sigep-cronograma-breadcrumb"
        divided
        homeTo={homePath}
        items={[
          { label: "Página Inicial", to: homePath },
          { label: "Avisos importantes", to: avisosPath },
        ]}
      />
      <div>
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
            <i className="pi pi-megaphone" aria-hidden="true" />
          </span>
          <div>
            <h1>Avisos importantes</h1>
            <p>Consulte os comunicados cadastrados no Painel Informativo.</p>
          </div>
        </div>
        <BotaoSeplag
          type="button"
          label="Novo Informativo"
          icon="pi pi-plus"
          onClick={() => {
            setMensagem("");
            setNovoAberto(true);
          }}
        />
      </header>
      {mensagem && <p role="status">{mensagem}</p>}
      {novoAberto && (
        <NovoInformativoModal
          fechar={() => setNovoAberto(false)}
          adicionado={(aviso) => {
            setNovoAberto(false);
            setBusca("");
            setCategoria(categoriaAviso(aviso));
            setMensagem("Informativo cadastrado com sucesso.");
          }}
        />
      )}
      <section
        className="sigep-avisos-resumo"
        aria-label="Categorias dos avisos"
      >
        {categorias.map((item) => (
          <button
            key={item.id}
            type="button"
            style={cores(item)}
            className={`sigep-avisos-contador${categoria === item.id ? " is-active" : ""}`}
            aria-pressed={categoria === item.id}
            onClick={() => setCategoria(item.id)}
          >
            <span className="sigep-avisos-icone">
              <i className={item.icon} aria-hidden="true" />
            </span>
            <span>
              {item.nome}{" "}
              <strong>
                {
                  avisos.filter(
                    (aviso) =>
                      item.id === "todos" || categoriaAviso(aviso) === item.id,
                  ).length
                }
              </strong>
            </span>
          </button>
        ))}
      </section>
      <section
        className="sigep-cronograma-filtros sigep-avisos-filtros"
        aria-label="Filtros dos avisos"
      >
        <label>
          Buscar comunicado
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar comunicado..."
          />
        </label>
        <label>
          Tipo de aviso
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
          >
            {categorias.map((item) => (
              <option value={item.id} key={item.id}>
                {item.singular}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="sigep-cronograma-limpar"
          onClick={() => {
            setBusca("");
            setCategoria("todos");
          }}
        >
          <i className="pi pi-refresh" aria-hidden="true" /> Limpar filtro
        </button>
      </section>
      <p className="sigep-avisos-resultados" role="status">
        {filtrados.length} comunicado
        {filtrados.length === 1 ? " encontrado" : "s encontrados"}
      </p>
      <section
        className="sigep-avisos-grid"
        aria-label="Comunicados disponíveis"
      >
        {filtrados.map((aviso) => {
          const meta = metaAviso(aviso);
          return (
            <article
              className="sigep-avisos-card"
              style={cores(meta)}
              key={aviso.id}
            >
              <header>
                <span className="sigep-avisos-icone">
                  <i className={meta.icon} aria-hidden="true" />
                </span>
                <h2 title={aviso.titulo}>{aviso.titulo}</h2>
                <span className="sigep-avisos-tag">{meta.singular}</span>
              </header>
              <span className="sigep-avisos-data">
                <i className="pi pi-calendar" aria-hidden="true" />
                {aviso.dataPostagem || "Data não informada"}
              </span>
              <p className="sigep-avisos-preview">{aviso.texto}</p>
              <button
                type="button"
                className="sigep-avisos-ler"
                aria-label={`Ler comunicado: ${aviso.titulo}`}
                onClick={() => setLeituraId(aviso.id)}
              >
                Ler comunicado{" "}
                <i className="pi pi-arrow-right" aria-hidden="true" />
              </button>
            </article>
          );
        })}
        {!filtrados.length && (
          <div className="sigep-avisos-vazio">
            <i className="pi pi-inbox" aria-hidden="true" />
            <h2>
              {avisos.length
                ? "Nenhum comunicado encontrado."
                : "Nenhum comunicado disponível."}
            </h2>
            <p>
              {avisos.length
                ? "Ajuste os filtros para consultar outros avisos."
                : "Os comunicados publicados no Painel Informativo aparecerão aqui."}
            </p>
          </div>
        )}
      </section>
      <ModalMensagemSeplag
        visible={!!leitura}
        titulo={leitura?.titulo ?? "Comunicado"}
        tipo={leitura ? categoriaAviso(leitura) : "informativo"}
        data={leitura?.dataPostagem || "Data não informada"}
        fechar={fechar}
        anexos={
          leitura?.documentos?.length ? (
            <AnexarDocumentoSeplag
              cols="12"
              label="Documentos anexados"
              arquivosBase64={leitura.documentos}
              handleViewArquivo={(arquivo) => abrirDocumento(arquivo)}
              onDownloadArquivo={(arquivo) => abrirDocumento(arquivo, true)}
            />
          ) : undefined
        }
      >
        <p>{leitura?.texto}</p>
      </ModalMensagemSeplag>
    </main>
  );
}
