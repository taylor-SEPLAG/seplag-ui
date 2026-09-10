import { Link } from "react-router-dom";
import { CONTROLE_VAGAS_BASE_PATH as BASE } from "./constants";
import "./vagasEfetivos.css";

export function VagasEfetivosContent() {
  return (
    <main className="prototype-efetivos-page">
      <header>
        <span>Controle de Vagas</span>
        <h1>Servidores Efetivos</h1>
        <p>Selecione uma opção para consultar e gerenciar as vagas dos servidores efetivos.</p>
      </header>
      <nav className="prototype-efetivos-options" aria-label="Opções de vagas efetivas">
        <Link to={`${BASE}/quadro-autorizado`}>
          <i className="pi pi-book" aria-hidden="true" />
          <h2>Quadro Servidores Efetivos</h2>
          <p>Consulte os cargos, a base legal e os quantitativos autorizados.</p>
          <span>Acessar quadro <i className="pi pi-arrow-right" aria-hidden="true" /></span>
        </Link>
        <Link to={`${BASE}/vagas`}>
          <i className="pi pi-id-card" aria-hidden="true" />
          <h2>Vagas Servidores Efetivos</h2>
          <p>Acompanhe a situação, a ocupação e o histórico de cada vaga.</p>
          <span>Acessar vagas <i className="pi pi-arrow-right" aria-hidden="true" /></span>
        </Link>
      </nav>
    </main>
  );
}
