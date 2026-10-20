import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { IMenuSeplag } from "../../componentes/layout/Config/menu";
import { funcionalidades, modulosPaginaInicial } from "./model";
import "./paginaInicial.css";
import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import { AVISOS_PATH } from "../avisos/model";
import {
  CALENDARIO_CRONOGRAMA_PATH,
  dataBR,
  type EventoCronograma,
} from "../cronograma/model";

interface Props {
  modulos?: readonly {
    nome: string;
    descricao: string;
    icone: string;
    corIcone?: string;
  }[];
  avisosDestino?: string;
  cronogramaDestino?: string;
  menu: IMenuSeplag[];
  nomeUsuario: string;
  avisos: number;
  cronogramas: number;
  proximo?: EventoCronograma;
}

export function PaginaInicialContent({
  menu,
  nomeUsuario,

  proximo,
  modulos = modulosPaginaInicial,
  avisosDestino = AVISOS_PATH,
  cronogramaDestino = CALENDARIO_CRONOGRAMA_PATH,
}: Props) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setAgora(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const destinos = funcionalidades(menu);
  const primeiroNome = nomeUsuario.trim().split(/\s+/)[0];
  const nome = primeiroNome
    ? primeiroNome[0].toLocaleUpperCase("pt-BR") +
      primeiroNome.slice(1).toLocaleLowerCase("pt-BR")
    : "usuário";
  const painel = destinos.find((item) => item.nome === "Painel Informativo");
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
        <time
          className="sigep-inicial-data"
          dateTime={new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Cuiaba",
          }).format(agora)}
        >
          <i className="pi pi-calendar" aria-hidden="true" />
          {new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeZone: "America/Cuiaba",
          }).format(agora)}
        </time>
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
              <Link to={avisosDestino}>
                Ver detalhes{" "}
                <i className="pi pi-arrow-right" aria-hidden="true" />
              </Link>
            )}
          </div>
        </article>
        {painel ? (
          <Link
            className="sigep-inicial-informativo sigep-inicial-cronograma sigep-inicial-cor-laranja"
            to={cronogramaDestino}
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
          {[...modulos]
            .sort(
              (a, b) =>
                Number(favoritos.includes(b.nome)) -
                Number(favoritos.includes(a.nome)),
            )
            .flatMap((modulo) => {
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
                <div key={modulo.nome} className="sigep-inicial-card-wrapper">
                  <ModuleNavigationCard
                    key={modulo.nome}
                    id={modulo.nome}
                    titulo={modulo.nome}
                    descricao={modulo.descricao}
                    icone={modulo.icone}
                    cor={modulo.corIcone}
                    destino={item?.caminho}
                    horizontal
                    tituloNivel="h3"
                    className="sigep-inicial-modulo"
                  />
                  <button
                    type="button"
                    className="sigep-inicial-favorito"
                    aria-label={`${favoritos.includes(modulo.nome) ? "Remover dos favoritos" : "Adicionar aos favoritos"}: ${modulo.nome}`}
                    title={
                      favoritos.includes(modulo.nome)
                        ? "Remover dos favoritos"
                        : "Adicionar aos favoritos"
                    }
                    aria-pressed={favoritos.includes(modulo.nome)}
                    onClick={() =>
                      setFavoritos((atuais) =>
                        atuais.includes(modulo.nome)
                          ? atuais.filter((nome) => nome !== modulo.nome)
                          : [...atuais, modulo.nome],
                      )
                    }
                  >
                    <i
                      className={`pi ${favoritos.includes(modulo.nome) ? "pi-star-fill" : "pi-star"}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>,
              ];
            })}
        </div>
      </section>
    </main>
  );
}
