import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import "../cadastro/cadastroGeral.css";

const areas = [
  {
    titulo: "Cadastro de Certames",
    descricao: "Cadastre e acompanhe concursos e processos seletivos.",
    icone: "pi pi-file-edit",
    destino: "/prototipos/sigep/controle-pss/certames",
  },
  {
    titulo: "Comissões",
    descricao: "Gerencie as comissões responsáveis pelos certames.",
    icone: "pi pi-users",
    destino: "/prototipos/sigep/controle-pss/comissoes",
  },
  {
    titulo: "Locais",
    descricao: "Organize os locais utilizados nas etapas dos certames.",
    icone: "pi pi-map-marker",
    destino: "/prototipos/sigep/controle-pss/locais",
  },
  {
    titulo: "Fase do Certame",
    descricao: "Configure e acompanhe as fases de cada certame.",
    icone: "pi pi-list-check",
    destino: "/prototipos/sigep/controle-pss/fases-certame",
  },
  {
    titulo: "Tipos de Cota",
    descricao: "Cadastre os tipos de cota aplicáveis aos certames.",
    icone: "pi pi-percentage",
    destino: "/prototipos/sigep/controle-pss/tipos-cota",
  },
] as const;

export function ControleCertameGeralContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <h1>Controle de Certame</h1>
        <p>
          Selecione uma área para consultar e gerenciar os dados dos certames.
        </p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label="Áreas do Controle de Certame"
      >
        {areas.map((area) => (
          <ModuleNavigationCard
            key={area.titulo}
            id={area.destino}
            titulo={area.titulo}
            descricao={area.descricao}
            icone={area.icone}
            destino={area.destino}
            modulo="Controle de Certame"
          />
        ))}
      </section>
    </main>
  );
}
