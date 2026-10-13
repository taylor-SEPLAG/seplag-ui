import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import { CONTROLE_VAGAS_BASE_PATH as BASE } from "./constants";
import "./vagasEfetivos.css";

export function VagasEfetivosContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <span>Controle de Vagas</span>
        <h1>Servidores Efetivos</h1>
        <p>
          Selecione uma opção para consultar e gerenciar as vagas dos servidores
          efetivos.
        </p>
      </header>
      <nav
        className="sigep-module-navigation-grid"
        aria-label="Opções de vagas efetivas"
      >
        <ModuleNavigationCard
          id={`${BASE}/quadro-autorizado`}
          titulo="Quadro Servidores Efetivos"
          descricao="Consulte os cargos, a base legal e os quantitativos autorizados."
          icone="pi pi-book"
          destino={`${BASE}/quadro-autorizado`}
          modulo="Controle de Vagas"
          textoAcao="Acessar quadro"
        />
        <ModuleNavigationCard
          id={`${BASE}/vagas`}
          titulo="Vagas Servidores Efetivos"
          descricao="Acompanhe a situação, a ocupação e o histórico de cada vaga."
          icone="pi pi-id-card"
          destino={`${BASE}/vagas`}
          modulo="Controle de Vagas"
          textoAcao="Acessar vagas"
        />
      </nav>
    </main>
  );
}
