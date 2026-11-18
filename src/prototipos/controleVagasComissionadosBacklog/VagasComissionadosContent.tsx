import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import { CONTROLE_VAGAS_BASE_PATH as BASE } from "./constants";
import "./vagasComissionados.css";

export function VagasComissionadosContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <span>Controle de Vagas</span>
        <h1>Comissionados</h1>
        <p>
          Selecione uma opção para consultar e gerenciar as vagas dos servidores
          comissionados.
        </p>
      </header>
      <nav
        className="sigep-module-navigation-grid"
        aria-label="Opções de vagas de comissionados"
      >
        <ModuleNavigationCard
          id={`${BASE}/quadro-autorizado`}
          titulo="Quadro Autorizado"
          descricao="Consulte os cargos, a base legal e os quantitativos autorizados."
          icone="pi pi-book"
          destino={`${BASE}/quadro-autorizado`}
          modulo="Controle de Vagas"
          textoAcao="Acessar quadro"
        />
        <ModuleNavigationCard
          id={`${BASE}/vagas`}
          titulo="Vagas Individualizadas"
          descricao="Acompanhe a situação, a ocupação e o histórico de cada vaga."
          icone="pi pi-id-card"
          destino={`${BASE}/vagas`}
          modulo="Controle de Vagas"
          textoAcao="Acessar vagas"
        />
        <ModuleNavigationCard
          id={`${BASE}/limites-dga`}
          titulo="Limites de DGA"
          descricao="Gerencie os quantitativos legais por órgão, vigência, cargo em comissão e função de confiança."
          icone="pi pi-chart-bar"
          destino={`${BASE}/limites-dga`}
          modulo="Controle de Vagas"
          textoAcao="Acessar limites"
        />
      </nav>
    </main>
  );
}
