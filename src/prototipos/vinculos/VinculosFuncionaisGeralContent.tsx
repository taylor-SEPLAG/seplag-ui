import { Link } from "react-router-dom";
import "../cadastro/cadastroGeral.css";

const areas = [
  { titulo: "Tipos de Vínculos", descricao: "Configure os tipos de vínculo funcional disponíveis.", icone: "pi pi-tags", destino: "/prototipos/sigep/tipo-vinculo" },
  { titulo: "Gestão de Ingresso", descricao: "Acompanhe os ingressos de pessoas no serviço público.", icone: "pi pi-user-plus", destino: "/prototipos/sigep/ingressos-teste" },
  { titulo: "Efetivo Exercício", descricao: "Registre e acompanhe o efetivo exercício dos ingressos.", icone: "pi pi-check-circle", destino: "/prototipos/sigep/ingressos/efetivo-exercicio" },
] as const;

export function VinculosFuncionaisGeralContent() {
  return (
    <main className="prototype-cadastro-geral">
      <header>
        <h1>Vínculos Funcionais</h1>
        <p>Selecione uma área para consultar e gerenciar os vínculos funcionais.</p>
      </header>

      <section aria-label="Áreas de Vínculos Funcionais">
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
