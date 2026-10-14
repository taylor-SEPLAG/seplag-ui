import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import "../cadastro/cadastroGeral.css";

export function DireitosBeneficiosPage() {
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <main className="sigep-module-navigation-page">
      <header><h1>Direitos e Benefícios</h1><p>Selecione uma área para consultar e gerenciar os direitos e benefícios dos servidores.</p></header>
      <section className="sigep-module-navigation-grid" aria-label="Áreas de Direitos e Benefícios">
        <ModuleNavigationCard id="concessao-ferias" titulo="Concessão de Férias" descricao="Consulte e gerencie solicitações, períodos de férias e substituições." icone="pi pi-calendar" destino="/prototipos/sigep/ferias" modulo="Direitos e Benefícios" />
      </section>
    </main>
  </PrototypeSystemPage>;
}
