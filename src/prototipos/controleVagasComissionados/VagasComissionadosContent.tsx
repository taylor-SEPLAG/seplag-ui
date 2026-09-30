import { Link } from "react-router-dom";
import { CONTROLE_VAGAS_BASE_PATH as BASE } from "./constants";
import "./vagasComissionados.css";

export function VagasComissionadosContent() {
  return (
    <main className="prototype-comissionados-efetivos-page">
      <header>
        <span>Controle de Vagas</span>
        <h1>Comissionados</h1>
        <p>Selecione uma opção para consultar e gerenciar as vagas dos servidores comissionados.</p>
      </header>
      <nav className="prototype-comissionados-efetivos-options" aria-label="Opções de vagas de comissionados">
        <Link to={`${BASE}/quadro-autorizado`}>
          <i className="pi pi-book" aria-hidden="true" />
          <h2>Quadro Autorizado</h2>
          <p>Consulte os cargos, a base legal e os quantitativos autorizados.</p>
          <span>Acessar quadro <i className="pi pi-arrow-right" aria-hidden="true" /></span>
        </Link>
        <Link to={`${BASE}/vagas`}>
          <i className="pi pi-id-card" aria-hidden="true" />
          <h2>Vagas Individualizadas</h2>
          <p>Acompanhe a situação, a ocupação e o histórico de cada vaga.</p>
          <span>Acessar vagas <i className="pi pi-arrow-right" aria-hidden="true" /></span>
        </Link>
        <Link to={`${BASE}/limites-dga`}>
          <i className="pi pi-chart-bar" aria-hidden="true" />
          <h2>Limites de DGA</h2>
          <p>Gerencie os quantitativos legais por órgão, vigência, cargo em comissão e função de confiança.</p>
          <span>Acessar limites <i className="pi pi-arrow-right" aria-hidden="true" /></span>
        </Link>
      </nav>
    </main>
  );
}

