import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import "../cadastro/cadastroGeral.css";

const areas = [
  {
    titulo: "Dashboard de Vínculos",
    descricao: "Acompanhe os indicadores e a distribuição dos vínculos funcionais.",
    icone: "pi pi-chart-bar",
    destino: "/prototipos/sigep/dashboard-vinculos",
  },
  {
    titulo: "Tipos de Vínculos",
    descricao: "Configure os tipos de vínculo funcional disponíveis.",
    icone: "pi pi-tags",
    destino: "/prototipos/sigep/tipo-vinculo",
  },
  {
    titulo: "Vínculo",
    descricao: "Consulte e gerencie os vínculos funcionais dos servidores.",
    icone: "pi pi-link",
    destino: "/prototipos/sigep/vinculos-v2",
  },
  {
    titulo: "Vida Funcional do Servidor",
    descricao: "Consulte os vínculos e a trajetória funcional dos servidores.",
    icone: "pi pi-history",
    destino: "/prototipos/sigep/vida-funcional",
  },
  {
    titulo: "Pasta Funcional do Servidor",
    descricao:
      "Consulte os documentos consolidados da vida funcional e anexe documentos complementares.",
    icone: "pi pi-folder-open",
    destino: "/prototipos/sigep/pasta-funcional",
  },
] as const;

export function VinculosFuncionaisGeralContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <h1>Vínculos Funcionais</h1>
        <p>
          Selecione uma área para consultar e gerenciar os vínculos funcionais.
        </p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label="Áreas de Vínculos Funcionais"
      >
        {areas.map((area) => (
          <ModuleNavigationCard
            key={area.titulo}
            id={area.destino}
            titulo={area.titulo}
            descricao={area.descricao}
            icone={area.icone}
            destino={area.destino}
            modulo="Vínculos Funcionais"
          />
        ))}
      </section>
    </main>
  );
}
