import { Link } from "react-router-dom";
import "./ingressoGeral.css";

const destinosIngresso = [
  {
    titulo: "Gestão de Ingresso",
    descricao: "Acompanhe e gerencie os processos de ingresso em andamento.",
    icone: "pi pi-users",
    destino: "/prototipos/sigep/ingressos-teste",
  },
  {
    titulo: "Efetivo Exercício",
    descricao: "Registre e acompanhe o início do efetivo exercício dos servidores.",
    icone: "pi pi-briefcase",
    destino: "/prototipos/sigep/ingressos/efetivo-exercicio",
  },
  {
    titulo: "Ingresso Comissionados",
    descricao: "Gerencie os ingressos de servidores exclusivamente comissionados.",
    icone: "pi pi-id-card",
    destino: "/prototipos/sigep/ingressos/comissionados",
  },
] as const;

export function IngressoGeralContent() {
  return (
    <main className="prototype-ingresso-geral">
      <header>
        <span>Ingresso</span>
        <h1>Ingresso</h1>
        <p>Selecione uma área para acompanhar e gerenciar os processos de ingresso.</p>
      </header>

      <section aria-label="Áreas de Ingresso">
        {destinosIngresso.map((item) => (
          <Link key={item.destino} to={item.destino}>
            <i className={item.icone} aria-hidden="true" />
            <h2>{item.titulo}</h2>
            <p>{item.descricao}</p>
            <span>Acessar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}