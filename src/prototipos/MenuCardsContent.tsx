import { Link } from "react-router-dom";
import "./cadastro/cadastroGeral.css";

export interface MenuCardItem {
  titulo: string;
  descricao: string;
  icone: string;
  destino?: string;
}

interface MenuCardsContentProps {
  titulo: string;
  descricao: string;
  itens: readonly MenuCardItem[];
}

/** Página intermediária para os grupos expansíveis do menu do SIGEP. */
export function MenuCardsContent({ titulo, descricao, itens }: Readonly<MenuCardsContentProps>) {
  return (
    <main className="prototype-cadastro-geral">
      <header>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </header>

      <section aria-label={`Áreas de ${titulo}`}>
        {itens.map((item) =>
          item.destino ? (
            <Link key={item.titulo} to={item.destino}>
              <i className={item.icone} aria-hidden="true" />
              <h2>{item.titulo}</h2>
              <p>{item.descricao}</p>
              <span>Acessar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
            </Link>
          ) : (
            <article key={item.titulo} className="prototype-menu-card--unavailable" aria-disabled="true">
              <i className={item.icone} aria-hidden="true" />
              <h2>{item.titulo}</h2>
              <p>{item.descricao}</p>
              <span>Em definição</span>
            </article>
          ),
        )}
      </section>
    </main>
  );
}
