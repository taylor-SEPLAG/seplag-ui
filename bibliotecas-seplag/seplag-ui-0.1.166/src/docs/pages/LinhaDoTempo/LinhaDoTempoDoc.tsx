import { useState } from "react";
import { LinhaDoTempoSeplag, type LinhaDoTempoItemSeplag } from "@componentes/LinhaDoTempo";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";
import "primereact/resources/themes/saga-blue/theme.css";

const historicoExemplo: LinhaDoTempoItemSeplag[] = [
  {
    id: "solicitacao",
    titulo: "Solicitação criada",
    data: "08/08/2026 às 09:12",
    dataIso: "2026-08-08T09:12:00-04:00",
    descricao: "A solicitação foi registrada e encaminhada para análise.",
    metadados: "João da Silva · Protocolo 2026.001245",
    icone: "pi pi-file-edit",
    variante: "info",
  },
  {
    id: "analise",
    titulo: "Documentação validada",
    data: "09/08/2026 às 14:35",
    dataIso: "2026-08-09T14:35:00-04:00",
    descricao: "Todos os documentos obrigatórios foram conferidos.",
    metadados: "Coordenadoria de Atendimento",
    icone: "pi pi-check",
    variante: "success",
  },
  {
    id: "pendencia",
    titulo: "Aguardando manifestação",
    data: "10/08/2026 às 10:20",
    dataIso: "2026-08-10T10:20:00-04:00",
    descricao: "Prazo para manifestação: 5 dias úteis.",
    metadados: "Situação atual",
    icone: "pi pi-clock",
    variante: "warning",
  },
];

function SelecaoInterativaExemplo() {
  const [selecionadoId, setSelecionadoId] = useState<string | number>("analise");

  return (
    <LinhaDoTempoSeplag
      ariaLabel="Histórico com seleção"
      itens={historicoExemplo}
      itemSelecionadoId={selecionadoId}
      onItemClick={(item) => setSelecionadoId(item.id)}
    />
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Informe os eventos na ordem em que devem aparecer. Cada item pode ter título, data, descrição, metadados, ícone e variante semântica.",
    example: (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <LinhaDoTempoSeplag titulo="Histórico da solicitação" itens={historicoExemplo} />
      </div>
    ),
    code: `import {
  LinhaDoTempoSeplag,
  type LinhaDoTempoItemSeplag,
} from "@seplag/ui-lib-react-18";

const historico: LinhaDoTempoItemSeplag[] = [
  {
    id: "solicitacao",
    titulo: "Solicitação criada",
    data: "08/08/2026 às 09:12",
    dataIso: "2026-08-08T09:12:00-04:00",
    descricao: "A solicitação foi registrada e encaminhada para análise.",
    metadados: "João da Silva · Protocolo 2026.001245",
    icone: "pi pi-file-edit",
    variante: "info",
  },
  {
    id: "analise",
    titulo: "Documentação validada",
    data: "09/08/2026 às 14:35",
    dataIso: "2026-08-09T14:35:00-04:00",
    icone: "pi pi-check",
    variante: "success",
  },
];

<LinhaDoTempoSeplag
  titulo="Histórico da solicitação"
  itens={historico}
/>;`,
  },
  {
    title: "Variantes semânticas",
    description:
      "Use as variantes para comunicar o significado do evento. Quando variante e ícone não são informados, o componente usa neutral e pi pi-circle-fill.",
    example: (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <LinhaDoTempoSeplag
          ariaLabel="Exemplos de variantes"
          itens={[
            {
              id: "neutral",
              titulo: "Evento neutro",
              descricao: "Informação sem estado específico.",
            },
            {
              id: "info",
              titulo: "Informação recebida",
              variante: "info",
              icone: "pi pi-info",
            },
            {
              id: "success",
              titulo: "Etapa concluída",
              variante: "success",
              icone: "pi pi-check",
            },
            {
              id: "warning",
              titulo: "Atenção necessária",
              variante: "warning",
              icone: "pi pi-exclamation-triangle",
            },
            {
              id: "danger",
              titulo: "Solicitação rejeitada",
              variante: "danger",
              icone: "pi pi-times",
            },
          ]}
        />
      </div>
    ),
    code: `<LinhaDoTempoSeplag
  itens={[
    { id: 1, titulo: "Evento neutro" },
    { id: 2, titulo: "Informação recebida", variante: "info", icone: "pi pi-info" },
    { id: 3, titulo: "Etapa concluída", variante: "success", icone: "pi pi-check" },
    { id: 4, titulo: "Atenção necessária", variante: "warning", icone: "pi pi-exclamation-triangle" },
    { id: 5, titulo: "Solicitação rejeitada", variante: "danger", icone: "pi pi-times" },
  ]}
/>`,
  },
  {
    title: "Conteúdo personalizado",
    description:
      "Título, data, descrição e metadados aceitam ReactNode, permitindo incluir links, badges ou outras informações relevantes.",
    example: (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <LinhaDoTempoSeplag
          itens={[
            {
              id: "publicacao",
              titulo: (
                <span>
                  Processo publicado <strong style={{ color: "#15803d" }}>com sucesso</strong>
                </span>
              ),
              data: "11/08/2026 às 08:00",
              dataIso: "2026-08-11T08:00:00-04:00",
              descricao: (
                <span>
                  Consulte o processo <a href="#processo-12345">nº 12345/2026</a>.
                </span>
              ),
              metadados: <em>Diário Oficial do Estado</em>,
              icone: "pi pi-megaphone",
              variante: "success",
            },
          ]}
        />
      </div>
    ),
    code: `<LinhaDoTempoSeplag
  itens={[
    {
      id: "publicacao",
      titulo: <span>Processo publicado <strong>com sucesso</strong></span>,
      data: "11/08/2026 às 08:00",
      dataIso: "2026-08-11T08:00:00-04:00",
      descricao: <a href="/processos/12345">Consulte o processo nº 12345/2026</a>,
      metadados: <em>Diário Oficial do Estado</em>,
      icone: "pi pi-megaphone",
      variante: "success",
    },
  ]}
/>`,
  },
  {
    title: "Estado vazio",
    description:
      "Quando não há itens, uma mensagem acessível é exibida. Personalize o texto com mensagemVazia.",
    example: (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <LinhaDoTempoSeplag
          titulo="Histórico da solicitação"
          itens={[]}
          mensagemVazia="Esta solicitação ainda não possui movimentações."
        />
      </div>
    ),
    code: `<LinhaDoTempoSeplag
  titulo="Histórico da solicitação"
  itens={[]}
  mensagemVazia="Esta solicitação ainda não possui movimentações."
/>`,
  },
  {
    title: "Itens selecionáveis",
    description:
      "Informe onItemClick para tornar cada evento clicável (renderizado como button) e itemSelecionadoId para destacar o item ativo. Útil para telas com um painel de detalhe que reage à seleção do histórico. Sem onItemClick, o comportamento é idêntico ao uso básico — a mudança é aditiva e não afeta usos existentes.",
    example: (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <SelecaoInterativaExemplo />
      </div>
    ),
    code: `function Historico() {
  const [selecionadoId, setSelecionadoId] = useState<string | number>("analise");

  return (
    <LinhaDoTempoSeplag
      itens={historico}
      itemSelecionadoId={selecionadoId}
      onItemClick={(item) => setSelecionadoId(item.id)}
    />
  );
}`,
  },
];

const props: DocProp[] = [
  {
    name: "itens",
    type: "readonly LinhaDoTempoItemSeplag[]",
    required: true,
    description: "Eventos exibidos na ordem recebida.",
  },
  {
    name: "titulo",
    type: "ReactNode",
    description: "Título opcional exibido acima da lista.",
  },
  {
    name: "mensagemVazia",
    type: "ReactNode",
    defaultValue: '"Nenhum evento registrado."',
    description: "Conteúdo exibido quando itens está vazio.",
  },
  {
    name: "className",
    type: "string",
    description: "Classe CSS adicional aplicada ao elemento raiz.",
  },
  {
    name: "ariaLabel",
    type: "string",
    defaultValue: '"Linha do tempo"',
    description: "Nome acessível da região que contém a linha do tempo.",
  },
  {
    name: "itemSelecionadoId",
    type: "string | number",
    description:
      "Id do item destacado como selecionado. Comparado com itens[].id; sem efeito se onItemClick não for informado.",
  },
  {
    name: "onItemClick",
    type: "(item: LinhaDoTempoItemSeplag) => void",
    description:
      "Torna cada item clicável (renderizado como button). Quando omitida, os itens são renderizados como antes, sem interação.",
  },
  {
    name: "itens[].id",
    type: "string | number",
    required: true,
    description: "Identificador único usado como chave do evento.",
  },
  {
    name: "itens[].titulo",
    type: "ReactNode",
    required: true,
    description: "Título principal do evento.",
  },
  {
    name: "itens[].data",
    type: "ReactNode",
    description: "Data ou período apresentado visualmente.",
  },
  {
    name: "itens[].dataIso",
    type: "string",
    description: "Data em formato ISO aplicada ao atributo dateTime do elemento time.",
  },
  {
    name: "itens[].descricao",
    type: "ReactNode",
    description: "Descrição complementar do evento.",
  },
  {
    name: "itens[].metadados",
    type: "ReactNode",
    description: "Informações secundárias, como responsável, unidade ou protocolo.",
  },
  {
    name: "itens[].icone",
    type: "string",
    defaultValue: '"pi pi-circle-fill"',
    description: "Classes CSS do PrimeIcons usadas no marcador.",
  },
  {
    name: "itens[].variante",
    type: '"neutral" | "info" | "success" | "warning" | "danger"',
    defaultValue: '"neutral"',
    description: "Variante semântica que define as cores do marcador.",
  },
];

export default function LinhaDoTempoDoc() {
  return (
    <DocPage
      title="LinhaDoTempoSeplag"
      description="Exibe eventos em sequência cronológica, com marcador, data, descrição e metadados opcionais. Indicada para históricos de solicitações, processos e alterações de status."
      badge="Estável"
      since="v0.1.114"
      importStatement={`import { LinhaDoTempoSeplag } from "@seplag/ui-lib-react-18";
import type { LinhaDoTempoItemSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
