import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { IMenuSeplag } from "../../componentes/layout/Config/menu";
import {
  funcionalidades,
  modulosPaginaInicial,
  normalizarPesquisa,
} from "./model";
import "./paginaInicial.css";
import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import { AVISOS_PATH } from "../avisos/model";
import {
  CALENDARIO_CRONOGRAMA_PATH,
  dataBR,
  type EventoCronograma,
} from "../cronograma/model";

interface Props {
  menu: IMenuSeplag[];
  nomeUsuario: string;
  avisos: number;
  cronogramas: number;
  proximo?: EventoCronograma;
}

export function PaginaInicialContent({
  menu,
  nomeUsuario,
  cronogramas,
  proximo,
}: Props) {
  const navigate = useNavigate();
  const [pesquisa, setPesquisa] = useState("");
  const [aberta, setAberta] = useState(false);
  const [selecionado, setSelecionado] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listaId = useId();
  const destinos = funcionalidades(menu);
  const termo = normalizarPesquisa(pesquisa);
  const resultados = destinos.filter((item) =>
    normalizarPesquisa(item.nome).includes(termo),
  );
  const mostrar = aberta && !!termo;
  const primeiroNome = nomeUsuario.trim().split(/\s+/)[0];
  const nome = primeiroNome
    ? primeiroNome[0].toLocaleUpperCase("pt-BR") +
      primeiroNome.slice(1).toLocaleLowerCase("pt-BR")
    : "usuário";
  const painel = destinos.find((item) => item.nome === "Painel Informativo");
  const navegar = (caminho: string) => {
    setAberta(false);
    navigate(caminho);
  };

  const conteudoCronograma = (
    <>
      <span className="sigep-inicial-icone">
        <i className="pi pi-calendar" aria-hidden="true" />
      </span>
      <div>
        <h2>Cronograma</h2>
        {proximo ? (
          <>
            <strong className="sigep-inicial-proximo" title={proximo.nome}>
              Próximo evento: {proximo.nome}
            </strong>
            <p>
              Prazo: {dataBR(proximo.fim)} às{" "}
              {proximo.horario || "23:59 (limite do dia)"}
            </p>
          </>
        ) : (
          <>
            {!!cronogramas && (
              <strong>Nenhum prazo pendente disponível.</strong>
            )}
            <p>Acompanhe o calendário e os eventos da folha.</p>
          </>
        )}
        {painel && (
          <span className="sigep-inicial-ver-detalhes">
            Ver detalhes <i className="pi pi-arrow-right" aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <main className="sigep-pagina-inicial">
      <header className="sigep-inicial-cabecalho">
        <div>
          <h1>
            Olá, {nome}!{" "}
            <span className="sigep-inicial-saudacao" aria-hidden="true">
              👋
            </span>
          </h1>
          <p>
            Bem-vindo ao SIGEP. Consulte informações, acesse os módulos e
            acompanhe os principais eventos.
          </p>
        </div>
        <div
          className="sigep-inicial-busca"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setAberta(false);
          }}
        >
          <div className="sigep-inicial-input">
            <i className="pi pi-search" aria-hidden="true" />
            <input
              ref={input}
              aria-label="Buscar funcionalidade"
              placeholder="Buscar funcionalidade..."
              value={pesquisa}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={mostrar}
              aria-controls={listaId}
              aria-activedescendant={
                mostrar && resultados.length
                  ? `${listaId}-${selecionado}`
                  : undefined
              }
              onFocus={() => setAberta(true)}
              onChange={(event) => {
                setPesquisa(event.target.value);
                setAberta(true);
                setSelecionado(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setAberta(false);
                if (
                  (event.key === "ArrowDown" || event.key === "ArrowUp") &&
                  resultados.length
                ) {
                  event.preventDefault();
                  setAberta(true);
                  setSelecionado(
                    (atual) =>
                      (atual +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        resultados.length) %
                      resultados.length,
                  );
                }
                if (
                  event.key === "Enter" &&
                  mostrar &&
                  resultados[selecionado]
                ) {
                  event.preventDefault();
                  navegar(resultados[selecionado].caminho);
                }
              }}
            />
            {pesquisa && (
              <button
                type="button"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setPesquisa("");
                  setSelecionado(0);
                  input.current?.focus();
                }}
              >
                <i className="pi pi-times" aria-hidden="true" />
              </button>
            )}
          </div>
          {mostrar && (
            <div
              className="sigep-inicial-sugestoes"
              id={listaId}
              role="listbox"
              aria-label="Funcionalidades encontradas"
            >
              {resultados.length ? (
                resultados.map((item, indice) => (
                  <button
                    type="button"
                    key={item.caminho}
                    role="option"
                    id={`${listaId}-${indice}`}
                    aria-selected={indice === selecionado}
                    onMouseEnter={() => setSelecionado(indice)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navegar(item.caminho)}
                  >
                    <span>{item.nome}</span>
                    <small>{item.contexto || "SIGEP"}</small>
                  </button>
                ))
              ) : (
                <p role="status">Nenhuma funcionalidade encontrada.</p>
              )}
            </div>
          )}
        </div>
      </header>

      <section
        className="sigep-inicial-informacoes"
        aria-label="Informações importantes"
      >
        <article className="sigep-inicial-informativo sigep-inicial-avisos sigep-inicial-cor-royal">
          <span className="sigep-inicial-icone">
            <i className="pi pi-megaphone" aria-hidden="true" />
          </span>
          <div>
            <h2>Avisos importantes</h2>
            <p>Consulte os comunicados disponíveis para você.</p>
            {painel && (
              <Link to={AVISOS_PATH}>
                Ver detalhes{" "}
                <i className="pi pi-arrow-right" aria-hidden="true" />
              </Link>
            )}
          </div>
        </article>
        {painel ? (
          <Link
            className="sigep-inicial-informativo sigep-inicial-cronograma sigep-inicial-cor-laranja"
            to={CALENDARIO_CRONOGRAMA_PATH}
            aria-label="Cronograma — Ver detalhes"
          >
            {conteudoCronograma}
          </Link>
        ) : (
          <article className="sigep-inicial-informativo sigep-inicial-cronograma sigep-inicial-cor-laranja">
            {conteudoCronograma}
          </article>
        )}
      </section>

      <section aria-labelledby="sigep-acesso-rapido">
        <div className="sigep-inicial-secao">
          <h2 id="sigep-acesso-rapido">Acesso rápido</h2>
          <p>Acesse os principais módulos do sistema.</p>
        </div>
        <div className="sigep-inicial-modulos">
          {modulosPaginaInicial.flatMap((modulo) => {
            const item = destinos.find(
              (destino) => destino.nome === modulo.nome,
            );
            // Agrupadores disponíveis mas sem rota própria seguem o estado padrão Em definição.
            const grupoDisponivel = (itens: IMenuSeplag[]): boolean =>
              itens.some(
                (entrada) =>
                  entrada.label === modulo.nome ||
                  grupoDisponivel(entrada.items ?? []),
              );
            if (!item && !grupoDisponivel(menu)) return [];
            return [
              <ModuleNavigationCard
                key={modulo.nome}
                id={modulo.nome}
                titulo={modulo.nome}
                descricao={modulo.descricao}
                icone={modulo.icone}
                destino={item?.caminho}
                horizontal
                tituloNivel="h3"
                className="sigep-inicial-modulo"
              />,
            ];
          })}
        </div>
      </section>
    </main>
  );
}
