import { Link } from "react-router-dom";
import "../cadastro/cadastroGeral.css";

const areas = [
  { titulo: "Cadastro de Certames", descricao: "Cadastre e acompanhe concursos e processos seletivos.", icone: "pi pi-file-edit", destino: "/prototipos/sigep/controle-pss/certames" },
  { titulo: "Comissões", descricao: "Gerencie as comissões responsáveis pelos certames.", icone: "pi pi-users", destino: "/prototipos/sigep/controle-pss/comissoes" },
  { titulo: "Locais", descricao: "Organize os locais utilizados nas etapas dos certames.", icone: "pi pi-map-marker", destino: "/prototipos/sigep/controle-pss/locais" },
  { titulo: "Fase do Certame", descricao: "Configure e acompanhe as fases de cada certame.", icone: "pi pi-list-check", destino: "/prototipos/sigep/controle-pss/fases-certame" },
  { titulo: "Tipos de Cota", descricao: "Cadastre os tipos de cota aplicáveis aos certames.", icone: "pi pi-percentage", destino: "/prototipos/sigep/controle-pss/tipos-cota" },
] as const;

export function ControleCertameGeralContent() {
  return (
    <main className="prototype-cadastro-geral">
      <header>
        <h1>Controle de Certame</h1>
        <p>Selecione uma área para consultar e gerenciar os dados dos certames.</p>
      </header>

      <section aria-label="Áreas do Controle de Certame">
        {areas.map((area) => (
          <Link key={area.destino} to={area.destino}>
            <i className={area.icone} aria-hidden="true" />
            <h2>{area.titulo}</h2>
            <p>{area.descricao}</p>
            <span>Acessar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
