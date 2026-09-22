import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ListaArrastavelSeplag } from "@componentes/ListaArrastavel";
import { useState } from "react";

type FaseDemo = {
  id: string;
  nome: string;
  descricao: string;
};

const fasesIniciais: FaseDemo[] = [
  { id: "1", nome: "Inscricoes", descricao: "Abertura e encerramento das inscricoes" },
  { id: "2", nome: "Prova objetiva", descricao: "Aplicacao da prova objetiva" },
  { id: "3", nome: "Recursos", descricao: "Prazo para interposicao de recursos" },
  { id: "4", nome: "Homologacao", descricao: "Homologacao do resultado final" },
];

function reordenar<T>(items: readonly T[], origem: number, destino: number): T[] {
  const copia = [...items];
  const [removido] = copia.splice(origem, 1);
  copia.splice(destino, 0, removido);
  return copia;
}

function ListaArrastavelPlayground() {
  const [fases, setFases] = useState<FaseDemo[]>(fasesIniciais);

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <ListaArrastavelSeplag<FaseDemo>
        items={fases}
        getKey={(item) => item.id}
        ariaLabel="Fases do certame"
        onReordenar={(origem, destino) =>
          setFases((atual) => reordenar(atual, origem, destino))
        }
        renderItem={(item, indice) => (
          <div>
            <div style={{ fontWeight: 600 }}>
              {indice + 1}. {item.nome}
            </div>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{item.descricao}</div>
          </div>
        )}
      />
    </div>
  );
}

function ListaArrastavelVaziaPlayground() {
  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <ListaArrastavelSeplag<FaseDemo>
        items={[]}
        getKey={(item) => item.id}
        onReordenar={() => {}}
        renderItem={(item) => item.nome}
        emptyMessage="Nenhuma fase adicionada."
      />
    </div>
  );
}

function ListaArrastavelDesabilitadaPlayground() {
  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <ListaArrastavelSeplag<FaseDemo>
        items={fasesIniciais}
        getKey={(item) => item.id}
        onReordenar={() => {}}
        disabled
        renderItem={(item, indice) => (
          <div>
            {indice + 1}. {item.nome}
          </div>
        )}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Arraste os itens pelo icone para reordenar a lista. A ordem e mantida em estado local via onReordenar.",
    example: <ListaArrastavelPlayground />,
    code: `import { useState } from "react";
import { ListaArrastavelSeplag } from "@seplag/ui-lib-react-18";

function reordenar<T>(items: readonly T[], origem: number, destino: number): T[] {
  const copia = [...items];
  const [removido] = copia.splice(origem, 1);
  copia.splice(destino, 0, removido);
  return copia;
}

const [fases, setFases] = useState(fasesIniciais);

<ListaArrastavelSeplag
  items={fases}
  getKey={(item) => item.id}
  ariaLabel="Fases do certame"
  onReordenar={(origem, destino) =>
    setFases((atual) => reordenar(atual, origem, destino))
  }
  renderItem={(item, indice) => (
    <div>
      <div style={{ fontWeight: 600 }}>{indice + 1}. {item.nome}</div>
      <div>{item.descricao}</div>
    </div>
  )}
/>`,
  },
  {
    title: "Lista vazia",
    description: "Sem itens, exibe a mensagem definida em emptyMessage (ou o texto padrao).",
    example: <ListaArrastavelVaziaPlayground />,
    code: `<ListaArrastavelSeplag
  items={[]}
  getKey={(item) => item.id}
  onReordenar={handleReordenar}
  renderItem={(item) => item.nome}
  emptyMessage="Nenhuma fase adicionada."
/>`,
  },
  {
    title: "Desabilitada",
    description:
      "Com disabled, o atributo draggable e removido dos itens e a alca de arraste some — util em telas de visualizacao.",
    example: <ListaArrastavelDesabilitadaPlayground />,
    code: `<ListaArrastavelSeplag
  items={fases}
  getKey={(item) => item.id}
  onReordenar={handleReordenar}
  disabled
  renderItem={(item, indice) => <div>{indice + 1}. {item.nome}</div>}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "items",
    type: "readonly T[]",
    required: true,
    description: "Lista de itens que sera exibida, na ordem atual.",
  },
  {
    name: "getKey",
    type: "(item: T) => string",
    required: true,
    description: "Funcao para obter a chave unica de cada item.",
  },
  {
    name: "onReordenar",
    type: "(indiceOrigem: number, indiceDestino: number) => void",
    required: true,
    description:
      "Callback disparado ao soltar um item sobre outro. Quem mantem o novo array reordenado e o consumidor do componente.",
  },
  {
    name: "renderItem",
    type: "(item: T, indice: number) => ReactNode",
    required: true,
    description: "Renderiza o conteudo de cada linha da lista.",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Remove a alca de arraste e o atributo draggable dos itens.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Rotulo de acessibilidade da lista (<ul aria-label>).",
  },
  {
    name: "emptyMessage",
    type: "ReactNode",
    description: 'Mensagem exibida quando items esta vazio. Padrao: "Nenhum item adicionado."',
  },
  {
    name: "maxHeight",
    type: "string",
    description: "Altura maxima da lista, ativando scroll vertical interno quando definida.",
  },
];

export default function ListaArrastavelDoc() {
  return (
    <DocPage
      title="ListaArrastavel"
      badge="Estavel"
      since="v0.1.153"
      description="Lista generica com reordenacao via drag and drop nativo do navegador, sem dependencias externas."
      importStatement={`import { ListaArrastavelSeplag } from "@seplag/ui-lib-react-18";
import type { ListaArrastavelSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
