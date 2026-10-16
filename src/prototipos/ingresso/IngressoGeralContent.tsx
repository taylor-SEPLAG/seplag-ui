import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import "./ingressoGeral.css";

const destinosIngresso = [
  {
    titulo: "Dashboard de Ingresso",
    descricao: "Consulte os indicadores e acompanhe o andamento dos ingressos.",
    icone: "pi pi-chart-bar",
    destino: "/prototipos/sigep/ingressos/dashboard",
  },
  {
    titulo: "Dashboard Nomeados",
    descricao: "Acompanhe vagas dos editais, nomeações e ingressos por cargo/função.",
    icone: "pi pi-chart-bar",
    destino: "/prototipos/sigep/ingressos/dashboard-nomeados",
  },
  {
    titulo: "Gestão de Ingresso",
    descricao: "Acompanhe e gerencie os processos de ingresso em andamento.",
    icone: "pi pi-users",
    destino: "/prototipos/sigep/ingressos-teste",
  },
  {
    titulo: "Efetivo Exercício",
    descricao:
      "Registre e acompanhe o início do efetivo exercício dos servidores.",
    icone: "pi pi-briefcase",
    destino: "/prototipos/sigep/ingressos/efetivo-exercicio",
  },
  {
    titulo: "Ingresso Comissionados",
    descricao:
      "Gerencie os ingressos de servidores exclusivamente comissionados.",
    icone: "pi pi-id-card",
    destino: "/prototipos/sigep/ingressos/comissionados",
  },
] as const;

export function IngressoGeralContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <span>Ingresso</span>
        <h1>Ingresso</h1>
        <p>
          Selecione uma área para acompanhar e gerenciar os processos de
          ingresso.
        </p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label="Áreas de Ingresso"
      >
        {destinosIngresso.map((item) => (
          <ModuleNavigationCard
            key={item.titulo}
            id={item.destino}
            titulo={item.titulo}
            descricao={item.descricao}
            icone={item.icone}
            destino={item.destino}
            modulo="Ingresso"
          />
        ))}
      </section>
    </main>
  );
}
