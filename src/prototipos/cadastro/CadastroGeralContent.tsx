import { ModuleNavigationCard } from "../navigation/ModuleNavigationCard";
import "./cadastroGeral.css";

const areas = [
  {
    titulo: "Pessoas",
    descricao: "Consulte e mantenha os dados cadastrais das pessoas.",
    icone: "pi pi-users",
    destino: "/prototipos/sigep/pessoas/327305/vinculos",
  },
  {
    titulo: "Estrutura Organizacional",
    descricao:
      "Gerencie órgãos, entidades, unidades e a estrutura organizacional.",
    icone: "pi pi-sitemap",
    destino:
      "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/orgao-entidade",
  },
  {
    titulo: "Cargo e Concurso",
    descricao:
      "Cadastre carreiras, cargos, perfis profissionais e tabelas de vencimentos.",
    icone: "pi pi-briefcase",
    destino: "/prototipos/sigep/carreira",
  },
  {
    titulo: "Controle de Vagas",
    descricao: "Acompanhe os quadros e as vagas autorizadas.",
    icone: "pi pi-chart-bar",
    destino: "/prototipos/sigep/controle-vagas",
  },
  {
    titulo: "Movimentação",
    descricao: "Registre e acompanhe as movimentações funcionais.",
    icone: "pi pi-sync",
    destino: "/prototipos/sigep/movimentacao/cessoes",
  },
  {
    titulo: "Controle de Certame",
    descricao: "Gerencie certames, comissões, locais e fases de seleção.",
    icone: "pi pi-file-check",
    destino: "/prototipos/sigep/controle-pss/certames",
  },
  {
    titulo: "Vínculos Funcionais",
    descricao: "Configure tipos de vínculo e acompanhe os vínculos funcionais.",
    icone: "pi pi-link",
    destino: "/prototipos/sigep/tipo-vinculo",
  },
  {
    titulo: "Documentação",
    descricao: "Cadastre e organize os documentos legais do sistema.",
    icone: "pi pi-folder-open",
    destino: "/prototipos/sigep/documentos-legais",
  },
  {
    titulo: "Aposentadoria e Benefícios",
    descricao: "Acesse os cadastros de aposentadoria e benefícios.",
    icone: "pi pi-hourglass",
    destino: "/prototipos/aposentadoria",
  },
  {
    titulo: "Parametrização",
    descricao: "Defina os parâmetros e as configurações administrativas.",
    icone: "pi pi-cog",
    destino: "/prototipos/sigep/parametrizacao/gestao-documentos",
  },
] as const;

export function CadastroGeralContent() {
  return (
    <main className="sigep-module-navigation-page">
      <header>
        <h1>Cadastro</h1>
        <p>Selecione uma área para consultar e gerenciar seus cadastros.</p>
      </header>

      <section
        className="sigep-module-navigation-grid"
        aria-label="Áreas de cadastro"
      >
        {areas.map((area) => (
          <ModuleNavigationCard
            key={area.titulo}
            id={area.destino}
            titulo={area.titulo}
            descricao={area.descricao}
            icone={area.icone}
            destino={area.destino}
          />
        ))}
      </section>
    </main>
  );
}
