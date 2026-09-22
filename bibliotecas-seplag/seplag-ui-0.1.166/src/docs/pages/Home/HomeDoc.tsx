import { useNavigate } from "react-router-dom";
import { getDocsByCategory } from "../../config";
import "./HomeDoc.css";

const CATEGORY_ICONS: Record<string, string> = {
  Ações: "pi-bolt",
  Overlays: "pi-window-maximize",
  Formulários: "pi-pen-to-square",
  Utilitários: "pi-wrench",
  Feedback: "pi-bell",
  Exibição: "pi-eye",
};

export default function HomeDoc() {
  const navigate = useNavigate();
  const categories = getDocsByCategory();

  const totalComponents = categories.reduce((acc, cat) => acc + cat.entries.length, 0);

  return (
    <div className="home-doc">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <div className="home-hero-badge">
              <i className="pi pi-verified" /> Biblioteca Oficial SEPLAG-MT
            </div>
            <h1 className="home-hero-title">
              <span className="home-hero-title-muted">SEPLAG</span>{" "}
              <span className="home-hero-title-accent">UI</span>
              <br />
              Components
            </h1>
            <p className="home-hero-subtitle">
              Componentes React padronizados para sistemas do Estado de Mato Grosso. Construído
              sobre PrimeReact com identidade visual SEPLAG.
            </p>
          </div>
          <div className="home-hero-stats">
            <div className="home-stat">
              <span className="home-stat-value">{totalComponents}</span>
              <span className="home-stat-label">Componentes</span>
            </div>
            <div className="home-stat-divider" />
            <div className="home-stat">
              <span className="home-stat-value">{categories.length}</span>
              <span className="home-stat-label">Categorias</span>
            </div>
            <div className="home-stat-divider" />
            <div className="home-stat">
              <span className="home-stat-value">React 18</span>
              <span className="home-stat-label">Plataforma</span>
            </div>
            <div className="home-stat-divider" />
            <div className="home-stat">
              <span className="home-stat-value">PrimeReact</span>
              <span className="home-stat-label">UI Base</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="home-section">
        <h2 className="home-section-title">
          <i className="pi pi-play-circle" /> Início rápido
        </h2>
        <div className="home-code-block">
          <span className="home-code-label">Instalação</span>
          <pre>{`npm install @seplag/ui-lib-react-18`}</pre>
        </div>
        <div className="home-code-block" style={{ marginTop: "0.75rem" }}>
          <span className="home-code-label">Uso básico</span>
          <pre>{`import { BotaoSeplag, ModalSeplag } from "@seplag/ui-lib-react-18";
import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";
import { useToastSeplag } from "@seplag/ui-lib-react-18";

// Envolva a aplicação com o provider de Toast
<ToastProviderSeplag>
  <App />
</ToastProviderSeplag>`}</pre>
        </div>
      </div>

      {/* Categories */}
      <div className="home-section">
        <h2 className="home-section-title">
          <i className="pi pi-th-large" /> Componentes por categoria
        </h2>
        <div className="home-categories">
          {categories.map((cat) => (
            <div key={cat.label} className="home-cat-card">
              <div className="home-cat-header">
                <i className={`pi ${CATEGORY_ICONS[cat.label] ?? "pi-box"} home-cat-icon`} />
                <span className="home-cat-label">{cat.label}</span>
                <span className="home-cat-count">{cat.entries.length}</span>
              </div>
              <ul className="home-cat-entries">
                {cat.entries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="home-cat-link"
                      onClick={() => navigate(`/docs/${entry.id}`)}
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcut */}
      <div className="home-section">
        <h2 className="home-section-title">
          <i className="pi pi-star" /> Destaques
        </h2>
        <div className="home-shortcuts">
          <button
            type="button"
            className="home-shortcut"
            onClick={() => navigate("/docs/fields-playground")}
          >
            <i className="pi pi-sliders-h" />
            <span>Fields Playground</span>
            <small>Monte formulários interativos</small>
          </button>
          <button type="button" className="home-shortcut" onClick={() => navigate("/docs/botao")}>
            <i className="pi pi-bolt" />
            <span>Botão</span>
            <small>Todas as variantes disponíveis</small>
          </button>
          <button type="button" className="home-shortcut" onClick={() => navigate("/docs/toast")}>
            <i className="pi pi-bell" />
            <span>Toast</span>
            <small>Notificações em tempo real</small>
          </button>
          <button type="button" className="home-shortcut" onClick={() => navigate("/docs/modal")}>
            <i className="pi pi-window-maximize" />
            <span>Modal</span>
            <small>Dialogs e confirmações</small>
          </button>
        </div>
      </div>
    </div>
  );
}
