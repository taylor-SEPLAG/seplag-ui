import { PrototypeSystemPage, menuFolha } from "../PrototiposPage";
import {
  getPermissionsSeplag,
  type IMenuSeplag,
} from "../../componentes/layout/Config/menu";
import { menuDisponivel } from "../paginaInicial/model";
import { acessosPaginaInicialFolha } from "../paginaInicial/folhaModel";
import { ModuleNavigationCard } from "./ModuleNavigationCard";
import {
  areasNavegacaoFolha,
  type AreaNavegacaoFolha,
} from "./folhaNavigation";
import "../cadastro/cadastroGeral.css";

const complementos: Record<string, { descricao: string; icone: string }> = {
  "Solicitação de Rubrica": {
    descricao: "Consulte e acompanhe solicitações de rubricas.",
    icone: "pi pi-file-edit",
  },
  Evento: {
    descricao: "Consulte e gerencie os eventos da folha.",
    icone: "pi pi-file-edit",
  },
  "Tipo Evento": {
    descricao: "Consulte os tipos de eventos da folha.",
    icone: "pi pi-list",
  },
  "Pensão Alimentícia": {
    descricao: "Consulte os cadastros de pensão alimentícia.",
    icone: "pi pi-wallet",
  },
  "Pensão Especial": {
    descricao: "Consulte os cadastros de pensão especial.",
    icone: "pi pi-wallet",
  },
  "Pensão por Morte": {
    descricao: "Consulte os cadastros de pensão por morte.",
    icone: "pi pi-wallet",
  },
  "Retenções Judiciais": {
    descricao: "Consulte penhoras e retenções judiciais.",
    icone: "pi pi-folder-open",
  },
};
function encontrar(
  itens: IMenuSeplag[],
  nome: string,
): IMenuSeplag | undefined {
  for (const item of itens) {
    if (item.label === nome) return item;
    const filho = encontrar(item.items ?? [], nome);
    if (filho) return filho;
  }
}
export function FolhaAreaPage({ area }: { area: AreaNavegacaoFolha }) {
  const config = areasNavegacaoFolha[area];
  const menu = menuDisponivel(menuFolha, getPermissionsSeplag() ?? []);
  const grupo = encontrar(menu, config.nome);
  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menu}
    >
      <main className="sigep-module-navigation-page">
        <header>
          <h1>{config.nome}</h1>
          <p>{config.descricao}</p>
        </header>
        {grupo ? (
          <section
            className="sigep-module-navigation-grid"
            aria-label={`Áreas de ${config.nome}`}
          >
            {(grupo.items ?? []).map((item) => {
              const nome = item.label ?? "";
              const dados =
                acessosPaginaInicialFolha.find((a) => a.nome === nome) ??
                complementos[nome];
              return (
                <ModuleNavigationCard
                  key={nome}
                  id={nome}
                  titulo={nome}
                  descricao={
                    dados?.descricao ??
                    `Consulte ${nome.toLocaleLowerCase("pt-BR")}.`
                  }
                  icone={dados?.icone ?? item.icon ?? "pi pi-file"}
                  cor={config.cor}
                  destino={item.visibleOnRouter === false ? undefined : item.to}
                />
              );
            })}
          </section>
        ) : (
          <p role="alert">
            Você não possui permissão para consultar esta área.
          </p>
        )}
      </main>
    </PrototypeSystemPage>
  );
}
