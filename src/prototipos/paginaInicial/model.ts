import type { IMenuSeplag } from "../../componentes/layout/Config/menu";

export const modulosPaginaInicial = [
  {
    nome: "Painel Informativo",
    descricao: "Acompanhe informativos e informações gerenciais.",
    icone: "pi pi-th-large",
    cor: "royal",
  },
  {
    nome: "Pessoas",
    descricao: "Consulte e mantenha dados cadastrais.",
    icone: "pi pi-users",
    cor: "azul",
  },
  {
    nome: "Estrutura Organizacional",
    descricao: "Gerencie órgãos, entidades e unidades.",
    icone: "pi pi-sitemap",
    cor: "verde",
  },
  {
    nome: "Cargo e Concurso",
    descricao: "Cadastre carreiras, cargos e perfis.",
    icone: "pi pi-briefcase",
    cor: "amarelo",
  },
  {
    nome: "Controle de Vagas",
    descricao: "Acompanhe os quadros e vagas autorizadas.",
    icone: "pi pi-chart-bar",
    cor: "coral",
  },
  {
    nome: "Movimentação",
    descricao: "Registre e acompanhe movimentações.",
    icone: "pi pi-sync",
    cor: "lilas",
  },
  {
    nome: "Controle de Certame",
    descricao: "Gerencie concursos e processos seletivos.",
    icone: "pi pi-file-check",
    cor: "agua",
  },
  {
    nome: "Ingresso",
    descricao: "Gerencie o ingresso de servidores.",
    icone: "pi pi-sign-in",
    cor: "rosa",
  },
  {
    nome: "Vínculos Funcionais",
    descricao: "Gerencie vínculos e consulte o histórico funcional.",
    icone: "pi pi-link",
    cor: "medio",
  },
  {
    nome: "Direitos e Benefícios",
    descricao: "Consulte e gerencie a concessão de férias e benefícios.",
    icone: "pi pi-sun",
    cor: "amarelo",
  },
  {
    nome: "Desligamento de Vínculo",
    descricao: "Gerencie vacâncias e desligamentos.",
    icone: "pi pi-sign-out",
    cor: "roxo",
  },
  {
    nome: "Documentação",
    descricao: "Cadastre e organize documentos.",
    icone: "pi pi-folder-open",
    cor: "ciano",
  },
  {
    nome: "Aposentadoria e Benefícios",
    descricao: "Gerencie aposentadorias e benefícios.",
    icone: "pi pi-hourglass",
    cor: "lavanda",
  },
  {
    nome: "Parametrização",
    descricao: "Defina os parâmetros e configurações.",
    icone: "pi pi-cog",
    cor: "acinzentado",
  },
  {
    nome: "Backlog",
    descricao: "Acompanhe demandas e evoluções do sistema.",
    icone: "pi pi-list",
    cor: "laranja",
  },
];

export function menuDisponivel(
  menu: readonly IMenuSeplag[],
  permissoes: readonly string[] = [],
): IMenuSeplag[] {
  return menu
    .filter(
      (item) =>
        item.label !== null &&
        item.visibleOnMenu !== false &&
        !item.disabled &&
        (!item.permissionKeys ||
          item.permissionKeys.some((key) => permissoes.includes(key))),
    )
    .map((item) => ({
      ...item,
      items: item.items ? menuDisponivel(item.items, permissoes) : undefined,
    }));
}

export function funcionalidades(
  menu: readonly IMenuSeplag[],
  contexto = "",
): { nome: string; caminho: string; contexto: string }[] {
  return menu.flatMap((item) => [
    ...(item.to && item.visibleOnRouter !== false
      ? [{ nome: item.label ?? "", caminho: item.to, contexto }]
      : []),
    ...funcionalidades(item.items ?? [], item.label ?? contexto),
  ]);
}

export const normalizarPesquisa = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

// O sistema mantém um ciclo de folha, com várias seções. Contamos o ciclo,
// não suas seções nem cada evento, e usamos a mesma regra temporal do painel.
export function contarCronogramasAtivos(
  cronograma: { secoes: { eventos: { periodo: string }[] }[] },
  agora = new Date(),
) {
  const ativo = cronograma.secoes.some((secao) =>
    secao.eventos.some((evento) => {
      const partes = evento.periodo.split(" - ");
      const fim = partes[1]?.trim();
      if (!fim) return true; // Evento ainda sem período, tratado como Agendado no painel.
      const [data, horaData] = fim.split(/\s+/);
      const [dia, mes, ano = 2026] = data.split("/").map(Number);
      if (!dia || !mes) return true;
      const [hora = 23, minuto = 59] = (horaData || partes[2] || "23:59")
        .split(":")
        .map(Number);
      return (
        new Date(ano, mes - 1, dia, hora, minuto).getTime() >= agora.getTime()
      );
    }),
  );
  return Number(ativo);
}
