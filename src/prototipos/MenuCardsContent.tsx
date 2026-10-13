import { ModuleNavigationCard } from "./navigation/ModuleNavigationCard";

export interface MenuCardItem {
  titulo: string;
  descricao: string;
  icone: string;
  destino?: string;
  id?: string;
  modulo?: string;
  cor?: string;
  disponivel?: boolean;
  permissionKeys?: string[] | null;
}

interface MenuCardsContentProps {
  titulo: string;
  descricao: string;
  itens: readonly MenuCardItem[];
}

/** Página intermediária para os grupos expansíveis do menu do SIGEP. */
export function MenuCardsContent({
  titulo,
  descricao,
  itens,
}: Readonly<MenuCardsContentProps>) {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label={`Áreas de ${titulo}`}
      >
        {itens.map((item) => (
          <ModuleNavigationCard
            key={item.titulo}
            id={item.id ?? item.destino ?? item.titulo}
            titulo={item.titulo}
            descricao={item.descricao}
            icone={item.icone}
            destino={item.destino}
            modulo={item.modulo ?? titulo}
            cor={item.cor}
            disponivel={item.disponivel}
            permissionKeys={item.permissionKeys}
          />
        ))}
      </section>
    </main>
  );
}
