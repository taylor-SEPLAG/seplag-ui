import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { PaginaInicialSeplag, configurarPaginaInicialSeplag } from "@componentes/PaginaInicial";
import type {
  CicloPagamentoResponse,
} from "@componentes/PaginaInicial/Cronograma/types";
import type { InformativoResponse } from "@componentes/PaginaInicial/Informativos/types";
import { ApiProvider } from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// PaginaInicialSeplag injeta seus endpoints (Cronograma + Informativos) num apiSlice do
// RTK Query do sistema hospedeiro, via configurarPaginaInicialSeplag. Para exibir o
// componente REAL na doc — não uma simulação estrutural — montamos aqui um apiSlice isolado
// com um baseQuery fake que responde instantaneamente com dados de exemplo, sem exigir
// backend nem autenticação.

const informativosMock: InformativoResponse[] = [
  {
    id: 1,
    titulo: "Processamento em andamento",
    tipo: "INFORMACAO",
    texto:
      "Processamento da folha de junho iniciou em 16/06/2026. Você receberá notificação quando disponível para consulta.",
    dataPublicacao: "2026-06-26",
  },
  {
    id: 2,
    titulo: "Férias - saldo residual e intervalo mínimo",
    tipo: "ALERTA",
    texto:
      "O sistema não permitirá mais o registro de gozos que resultem em um saldo final de 5 dias. Verifique suas solicitações pendentes.",
    dataPublicacao: "2026-06-26",
  },
];

const cronogramaMock: CicloPagamentoResponse[] = [
  {
    id: 1,
    nome: "Ciclo de pagamento julho",
    status: "ativo",
    secoes: [
      {
        id: 1,
        idCicloPagamento: 1,
        nome: "Folha 1",
        ordem: 1,
        totalEventos: 1,
        eventos: [
          {
            id: 1,
            idSecao: 1,
            ordem: 1,
            dataInicio: "2026-07-01",
            dataFim: "2026-07-02",
            descricao: "Teste",
            status: "concluido",
          },
        ],
      },
      {
        id: 2,
        idCicloPagamento: 1,
        nome: "Folha 20",
        ordem: 2,
        totalEventos: 3,
        eventos: [
          {
            id: 2,
            idSecao: 2,
            ordem: 1,
            dataInicio: "2026-07-08",
            dataFim: "2026-07-09",
            descricao: "Teste 2",
            status: "concluido",
          },
          {
            id: 3,
            idSecao: 2,
            ordem: 2,
            dataInicio: "2026-07-07",
            dataFim: "2026-07-17",
            descricao: "N/A",
            status: "concluido",
          },
          {
            id: 4,
            idSecao: 2,
            ordem: 3,
            dataInicio: "2026-08-27",
            dataFim: "2026-08-31",
            descricao: "TA",
            status: "concluido",
          },
        ],
      },
    ],
  },
];

// baseQuery fake: resolve sincronamente a partir do `url`, sem chamar `fetch`.
const fakeBaseQuery = fetchBaseQuery({ baseUrl: "/" });
const mockApiSlice = createApi({
  reducerPath: "docsPaginaInicialApi",
  baseQuery: async (args) => {
    const url = typeof args === "string" ? args : args.url;
    if (url.includes("informativos")) {
      return { data: { content: informativosMock } };
    }
    if (url.includes("ciclo-pagamento")) {
      return { data: cronogramaMock };
    }
    return fakeBaseQuery(args, {} as never, {});
  },
  tagTypes: ["Informativos", "CicloPagamento"],
  endpoints: () => ({}),
});

let configurado = false;
function garantirConfiguracao() {
  if (configurado) return;
  configurarPaginaInicialSeplag(mockApiSlice);
  configurado = true;
}

function PaginaInicialPlayground() {
  garantirConfiguracao();

  return (
    <ApiProvider api={mockApiSlice}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <PaginaInicialSeplag />
      </div>
    </ApiProvider>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Componente real, com um apiSlice mockado localmente (sem backend). Clique em \"Configurar Cronograma\" no card da direita para ver a área de Informativos recolher e o Cronograma ocupar a largura total — é o mesmo toggle de estado (isViewingHome) que o componente usa em produção.",
    example: <PaginaInicialPlayground />,
    code: `import { PaginaInicialSeplag, configurarPaginaInicialSeplag } from "@seplag/ui-lib-react-18";

// uma única vez, no bootstrap da aplicação:
configurarPaginaInicialSeplag(apiSlice);

// em uma rota:
<PaginaInicialSeplag />`,
  },
  {
    title: "Configuração obrigatória (uma vez, no bootstrap da aplicação)",
    description:
      "Antes de renderizar PaginaInicialSeplag, o sistema hospedeiro deve registrar seu apiSlice do RTK Query via configurarPaginaInicialSeplag, para que os endpoints internos de cronograma e informativos possam ser injetados nele.",
    example: (
      <div style={{ color: "#64748b" }}>
        Chamada única de configuração — sem exemplo visual, veja o código ao lado.
      </div>
    ),
    code: `// src/app/store.ts (ou equivalente, uma única vez no bootstrap)
import { configurarPaginaInicialSeplag } from "@seplag/ui-lib-react-18";
import { apiSlice } from "./apiSlice";

configurarPaginaInicialSeplag(apiSlice);`,
  },
  {
    title: "Uso em uma rota",
    description: "Depois de configurado, o componente é usado como a página inicial (welcomePath) do AppRouterSeplag.",
    example: (
      <div style={{ color: "#64748b" }}>
        Ver o Playground acima para o componente renderizado — aqui, apenas o encaixe na rota.
      </div>
    ),
    code: `import { PaginaInicialSeplag } from "@seplag/ui-lib-react-18";

<AppRouterSeplag
  layout={AppLayout}
  paginaInicial={PaginaInicialSeplag}
  allowedRoutes={allowedRoutes}
  deniedRoutes={deniedRoutes}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "(sem props)",
    type: "—",
    description:
      "PaginaInicialSeplag não recebe props — obtém todos os dados via os endpoints RTK Query injetados através de configurarPaginaInicialSeplag.",
  },
];

export default function PaginaInicialDoc() {
  return (
    <DocPage
      title="PaginaInicial"
      badge="Estável"
      since="v0.1.153"
      description="Página inicial padrão do sistema, composta por Informativos e Cronograma, com dados obtidos via RTK Query. Requer configuração prévia via configurarPaginaInicialSeplag para injetar os endpoints internos no apiSlice do sistema hospedeiro."
      importStatement={`import { PaginaInicialSeplag, configurarPaginaInicialSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
