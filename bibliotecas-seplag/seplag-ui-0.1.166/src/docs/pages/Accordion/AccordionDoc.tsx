import { useMemo, useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { AccordionSeplag, type AccordionItemSeplag } from "@componentes/Accordion";
import type { ResultsSeplag } from "../../../interfaces/Results";
import "primereact/resources/themes/saga-blue/theme.css";

type Item = { id: number; name: string; group: string };

function makeData(count = 8) {
  const groups = ["Grupo A", "Grupo B", "Grupo C"];
  const items: Item[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      group: groups[i % groups.length],
    });
  }
  return items;
}

function AccordionPlayground() {
  const [rows, setRows] = useState(5);
  const [rowsPerPage, setRowsPerPage] = useState([5, 10, 20]);
  const [isFetching, setIsFetching] = useState(false);
  const [itemsCount, setItemsCount] = useState(9);
  const [enableAddButton, setEnableAddButton] = useState(false);
  const [addButtonLabel, setAddButtonLabel] = useState("Adicionar");
  const [dataKey, setDataKey] = useState("id");

  const items = useMemo(() => makeData(itemsCount), [itemsCount]);

  const data: ResultsSeplag<Item> = useMemo(
    () => ({
      content: items,
      last: true,
      totalPages: 1,
      pageActual: 0,
      sizePage: items.length,
      totalRecords: items.length,
      size: items.length,
      number: 0,
      numberOfElements: items.length,
      empty: items.length === 0,
      first: true,
    }),
    [items],
  );

  const groupBy = (all: Item[]) => {
    const map = new Map<string, Item[]>();
    for (const it of all) {
      const k = it.group;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    const groups: AccordionItemSeplag<Item>[] = [];
    let idx = 1;
    for (const [k, arr] of map.entries()) {
      groups.push({
        id: idx++,
        headerTitle: k,
        headerSubtitle: `${arr.length} itens`,
        items: arr,
      });
    }
    return groups;
  };

  function renderExpansion(group: AccordionItemSeplag<Item>) {
    return (
      <div style={{ padding: 8 }}>
        {group.items.map((it) => (
          <div key={it.id} className="py-2 border-bottom">
            {it.name}
          </div>
        ))}
      </div>
    );
  }

  const rowsPerPageText = rowsPerPage.join(",");

  const propsSnippet = [
    `rows={${rows}}`,
    `rowsPerPage={[${rowsPerPage.join(",")}]} ,`,
    `isFetching={${isFetching}}`,
    enableAddButton
      ? `handleAdicionar={(g) => { /* ... */ }}\n  addButtonLabel="${addButtonLabel}"`
      : null,
    `dataKey="${dataKey}"`,
  ]
    .filter(Boolean)
    .join("\n  ");

  const generatedCode = `import { AccordionSeplag } from "@seplag/ui-lib-react-18";

<AccordionSeplag
  data={/* ResultsSeplag */}
  ${propsSnippet}
/>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <AccordionSeplag
          data={data}
          rows={rows}
          rowsPerPage={rowsPerPage}
          isFetching={isFetching}
          groupBy={groupBy}
          renderExpansion={renderExpansion}
          handleOnPageChange={() => {}}
          dataKey={dataKey as any}
          handleAdicionar={enableAddButton ? () => alert("Adicionar clicado") : undefined}
          addButtonLabel={enableAddButton ? addButtonLabel : undefined}
        />
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label className="pg-label">rows</label>
          <input
            className="pg-input"
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value) || 1)}
          />
        </div>

        <div className="pg-field">
          <label className="pg-label">rowsPerPage (csv)</label>
          <input
            className="pg-input"
            value={rowsPerPageText}
            onChange={(e) =>
              setRowsPerPage(e.target.value.split(",").map((s) => Number(s.trim()) || 5))
            }
          />
        </div>

        <div className="pg-field">
          <label className="pg-label">itemsCount</label>
          <input
            className="pg-input"
            type="number"
            value={itemsCount}
            onChange={(e) => setItemsCount(Number(e.target.value) || 0)}
          />
        </div>

        <div className="pg-field">
          <label className="pg-label">isFetching</label>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${isFetching ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={isFetching}
                onChange={(e) => setIsFetching(e.target.checked)}
              />
              fetching
            </label>
          </div>
        </div>

        <div className="pg-field">
          <label className="pg-label">enable add button</label>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${enableAddButton ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={enableAddButton}
                onChange={(e) => setEnableAddButton(e.target.checked)}
              />
              habilitar
            </label>
          </div>
        </div>

        {enableAddButton && (
          <div className="pg-field">
            <label className="pg-label">addButtonLabel</label>
            <input
              className="pg-input"
              value={addButtonLabel}
              onChange={(e) => setAddButtonLabel(e.target.value)}
            />
          </div>
        )}

        <div className="pg-field">
          <label className="pg-label">dataKey</label>
          <input
            className="pg-input"
            value={dataKey}
            onChange={(e) => setDataKey(e.target.value)}
          />
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente o AccordionSeplag com dados de exemplo.",
    example: <AccordionPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description:
      "Agrupa itens por chave definida em `groupBy` e renderiza expansão via `renderExpansion`.",
    example: (
      <AccordionSeplag
        data={{
          content: makeData(6),
          last: true,
          totalPages: 1,
          pageActual: 0,
          sizePage: 6,
          totalRecords: 6,
          size: 6,
          number: 0,
          numberOfElements: 6,
          empty: false,
          first: true,
        }}
        rows={5}
        rowsPerPage={[5, 10]}
        isFetching={false}
        groupBy={(items) => {
          const map = new Map<string, Item[]>();
          for (const it of items) {
            const k = it.group;
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(it);
          }
          let idx = 1;
          return Array.from(map.entries()).map(([k, arr]) => ({
            id: idx++,
            headerTitle: k,
            items: arr,
          }));
        }}
        renderExpansion={(g) => (
          <div style={{ padding: 8 }}>
            {g.items.map((it) => (
              <div key={it.id}>{it.name}</div>
            ))}
          </div>
        )}
        handleOnPageChange={() => {}}
        dataKey="id"
      />
    ),
    code: `import { AccordionSeplag } from "@seplag/ui-lib-react-18";

// groupBy example
function groupBy(items) {
  const map = new Map();
  for (const it of items) {
    const k = it.group;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(it);
  }
  let idx = 1;
  return Array.from(map.entries()).map(([k, arr]) => ({ id: idx++, headerTitle: k, items: arr }));
}

function renderExpansion(group) {
  return (
    <div>
      {group.items.map(i => <div key={i.id}>{i.name}</div>)}
    </div>
  );
}

<AccordionSeplag data={/* ResultsSeplag */} rows={5} rowsPerPage={[5,10]} isFetching={false} groupBy={groupBy} renderExpansion={renderExpansion} handleOnPageChange={() => {}} dataKey="id" />`,
  },
];

const props: DocProp[] = [
  {
    name: "data",
    type: "ResultsSeplag<T>",
    required: true,
    description: "Dados paginados a serem agrupados.",
  },
  {
    name: "rows",
    type: "number",
    required: true,
    description: "Número de linhas exibidas por página.",
  },
  {
    name: "rowsPerPage",
    type: "number[]",
    required: true,
    description: "Opções de paginação.",
  },
  {
    name: "isFetching",
    type: "boolean",
    required: true,
    description: "Exibe estado de carregamento.",
  },
  {
    name: "groupBy",
    type: "(items: T[]) => AccordionItemSeplag<T>[]",
    required: true,
    description: "Função que agrupa itens em seções.",
  },
  {
    name: "renderExpansion",
    type: "(group: G) => ReactNode",
    required: true,
    description: "Renderiza conteúdo expandido do grupo.",
  },
  {
    name: "handleOnPageChange",
    type: "(page) => void",
    required: true,
    description: "Callback de mudança de página.",
  },
  {
    name: "handleAdicionar",
    type: "(group?) => void",
    required: false,
    description:
      "Callback chamado quando o botão de adicionar for clicado; recebe o grupo alvo (opcional).",
  },
  {
    name: "addButtonLabel",
    type: "string",
    required: false,
    description: "Label do botão de adicionar exibido no cabeçalho do grupo.",
  },
  {
    name: "dataKey",
    type: "keyof G",
    required: true,
    description: "Chave usada para identificar grupos.",
  },
];

export default function AccordionDoc() {
  return (
    <DocPage
      title="AccordionSeplag"
      description="Componente que exibe grupos colapsáveis com paginação e ações."
      importStatement={`import { AccordionSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
