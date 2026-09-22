import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import pkg from "../package.json";
import { DocsLayout, DocsRenderer } from "./docs/layout/DocsLayout";

function HomePage() {
  return (
    <div className="app-container">
      <div className="glow-1"></div>
      <div className="glow-2"></div>

      <nav className="main-nav">
        <div className="nav-content">
          <div className="logo-group">
            <span className="logo-seplag">SEPLAG</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Link
              to="/docs"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Documentação →
            </Link>
            <div className="version-tag">v{pkg.version}</div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="welcome-hero">
          <div className="visual-element">
            <div className="cube"></div>
          </div>
          <div className="text-element">
            <h1>A Linguagem Visual de Mato Grosso.</h1>
            <p>
              Importe, valide e experimente componentes padrão da <strong>SEPLAG</strong>. Garanta
              consistência e qualidade antes da publicação em produção.
            </p>
          </div>
        </section>

        <section className="status-grid">
          <div className="status-card current-pkg">
            <span className="card-label">Pacote Atual</span>
            <h3>{pkg.name}</h3>
            <span className="pkg-version">v{pkg.version}</span>
          </div>
          <div className="status-card registry-status">
            <span className="card-label">Registry</span>
            <div className="registry-info">
              <span className="status-dot online"></span>
              <h3>GIT LAB SEPLAG</h3>
            </div>
          </div>
          <div className="status-card quick-code">
            <span className="card-label">Uso Rápido</span>
            <code>npm install @seplag/ui-lib-react-18</code>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>Desenvolvido pela Coordenadoria de Desenvolvimento de Soluções de TI - SEPLAG-MT.</p>
        <p>© {new Date().getFullYear()} Governo do Estado de Mato Grosso</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/docs" element={<DocsLayout />}>
        <Route path=":id" element={<DocsRenderer />} />
        <Route index element={<DocsRenderer />} />
      </Route>
    </Routes>
  );
}

export default App;
