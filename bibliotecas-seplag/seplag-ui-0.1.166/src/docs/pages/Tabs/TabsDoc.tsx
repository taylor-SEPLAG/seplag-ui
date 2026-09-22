import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { TabsSeplag, type TabItemSeplag } from "@componentes/Tabs";
import { BotaoAdicionarSeplag, BotaoIconSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function TabsPlayground() {
  const initial: TabItemSeplag[] = [
    { id: "t1", label: "Geral", value: "geral" },
    { id: "t2", label: "Endereços", value: "enderecos" },
    { id: "t3", label: "Contatos", value: "contatos" },
  ];

  const [items, setItems] = useState<TabItemSeplag[]>(initial);
  const [active, setActive] = useState(items[0].value as any);

  function updateItem(idx: number, patch: Partial<TabItemSeplag>) {
    setItems((cur) => {
      const copy = cur.slice();
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  }

  // slugify is defined at module scope

  function addItem() {
    setItems((cur) => {
      const label = `Nova aba ${cur.length + 1}`;
      const next = {
        id: `t${Date.now()}`,
        label,
        value: slugify(label),
      };
      return [...cur, next];
    });
  }

  function removeItem(idx: number) {
    setItems((cur) => cur.filter((_, i) => i !== idx));
  }

  const generatedCode = `import { TabsSeplag } from "@seplag/ui-lib-react-18";\n\nconst items = ${JSON.stringify(items, null, 2)};\n\n<TabsSeplag items={items} onChange={(v) => console.log(v)} />`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ padding: "0.5rem", borderRadius: 8 }}>
        <TabsSeplag items={items} activeValue={active} onChange={(v) => setActive(v)} />
      </div>

      <div className="botao-playground-controls">
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <BotaoAdicionarSeplag onClick={addItem} />
          <span style={{ color: "#666" }}>Personalize a lista de abas abaixo.</span>
        </div>

        {items.map((it, idx) => (
          <div
            className="pg-field"
            key={it.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 40px",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              className="pg-input"
              placeholder="Rótulo da aba"
              value={it.label}
              onChange={(e) =>
                updateItem(idx, {
                  label: e.target.value,
                  value: slugify(e.target.value),
                })
              }
            />
            <BotaoIconSeplag
              icon="pi pi-times"
              tooltipOptions={{ position: "top" }}
              onClick={() => removeItem(idx)}
            />
          </div>
        ))}

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-active">
            activeValue
          </label>
          <select
            id="pg-active"
            className="pg-select"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            {items.map((it) => (
              <option key={it.id} value={it.value as any}>
                {it.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Teste as abas e receba o value selecionado via callback.",
    example: <TabsPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Renderiza um conjunto de botões de abas responsivos.",
    example: (
      <TabsSeplag
        items={[
          { id: "t1", label: "Geral", value: "geral" },
          { id: "t2", label: "Endereços", value: "enderecos" },
        ]}
      />
    ),
    code: `import { TabsSeplag } from "@seplag/ui-lib-react-18";\n\n<TabsSeplag items={[{ id: 't1', label: 'Geral', value: 'geral' }]} />`,
  },
];

const props: DocProp[] = [
  {
    name: "items",
    type: "TabItemSeplag[]",
    required: true,
    description: "Lista de abas a serem exibidas.",
  },
  {
    name: "activeIndex",
    type: "number",
    description: "Índice ativo (opcional).",
  },
  {
    name: "activeValue",
    type: "any",
    description: "Value ativo (opcional).",
  },
  {
    name: "onChange",
    type: "(value: any) => void",
    description: "Callback chamado ao selecionar uma aba.",
  },
  {
    name: "onTabChange",
    type: "(selectedTab: TabItemSeplag) => void",
    description: "Callback com o objeto da aba selecionada.",
  },
  {
    name: "className",
    type: "string",
    description: "Classe CSS adicional para o wrapper.",
  },
];

export default function TabsDoc() {
  return (
    <DocPage
      title="Tabs"
      badge="Estável"
      since="v0.0.1"
      description="Conjunto de abas representadas por botões responsivos. Usa `BotaoSeplag` internamente."
      importStatement={`import { TabsSeplag } from "@seplag/ui-lib-react-18";\nimport type { TabItemSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
