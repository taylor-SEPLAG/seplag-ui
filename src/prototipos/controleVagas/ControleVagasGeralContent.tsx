import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import "./controleVagasGeral.css";

const destinos = [
  {
    titulo: "Dashboard",
    descricao: "Acompanhe os indicadores consolidados do Controle de Vagas.",
    icone: "pi pi-chart-bar",
    destino: "/prototipos/sigep/controle-vagas/dashboard",
  },
  {
    titulo: "Vagas Efetivos",
    descricao:
      "Consulte e gerencie os quadros e vagas dos servidores efetivos.",
    icone: "pi pi-users",
    destino: "/prototipos/sigep/controle-vagas/efetivos",
  },
  {
    titulo: "Vagas Temporários",
    descricao:
      "Acompanhe os quadros vinculados a processos seletivos simplificados.",
    icone: "pi pi-briefcase",
    destino: "/prototipos/sigep/controle-vagas/temporarios",
  },
  {
    titulo: "Vagas Comissionados",
    descricao:
      "Gerencie estruturas, cargos em comissão e funções de confiança.",
    icone: "pi pi-sitemap",
    destino: "/prototipos/sigep/controle-vagas/comissionados",
  },
  {
    titulo: "Vagas Bolsistas",
    descricao: "Consulte quadros, distribuição e ocupação das vagas de bolsa.",
    icone: "pi pi-graduation-cap",
    destino: "/prototipos/sigep/controle-vagas/bolsistas",
  },
] as const;

export function ControleVagasGeralContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <h1>Controle de Vagas</h1>
        <p>
          Selecione uma área para consultar e gerenciar os quadros e as vagas
          autorizadas.
        </p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label="Áreas do Controle de Vagas"
      >
        {destinos.map((item) => (
          <ModuleNavigationCard
            key={item.titulo}
            id={item.destino}
            titulo={item.titulo}
            descricao={item.descricao}
            icone={item.icone}
            destino={item.destino}
            modulo="Controle de Vagas"
          />
        ))}
      </section>
    </main>
  );
}
