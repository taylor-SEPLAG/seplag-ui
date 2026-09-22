import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import type { BreadcrumbItemSeplag } from "@componentes/Breadcrumb";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Playground interativo
// ---------------------------------------------------------------------------

const ICON_OPTIONS = [
  { label: "Nenhum", value: "" },
  { label: "pi-briefcase", value: "pi pi-briefcase" },
  { label: "pi-sitemap", value: "pi pi-sitemap" },
  { label: "pi-building", value: "pi pi-building" },
  { label: "pi-users", value: "pi pi-users" },
  { label: "pi-file", value: "pi pi-file" },
  { label: "pi-cog", value: "pi pi-cog" },
];

interface PlaygroundItemState {
  id: number;
  label: string;
  icon: string;
  navigable: boolean;
}

let nextPlaygroundItemId = 0;

function createPlaygroundItem(
  data: Omit<PlaygroundItemState, "id">,
): PlaygroundItemState {
  nextPlaygroundItemId += 1;
  return { id: nextPlaygroundItemId, ...data };
}

const DEFAULT_ITEMS: PlaygroundItemState[] = [
  createPlaygroundItem({ label: "Cadastro", icon: "pi pi-briefcase", navigable: true }),
  createPlaygroundItem({
    label: "Estrutura Organizacional",
    icon: "pi pi-sitemap",
    navigable: true,
  }),
  createPlaygroundItem({ label: "Instituição", icon: "pi pi-building", navigable: true }),
  createPlaygroundItem({ label: "Cadastrar", icon: "", navigable: false }),
];

function itemsToPropsCode(items: PlaygroundItemState[], hasHome: boolean, homeHref: string) {
  const itemsCode = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const props = [
        `label: "${item.label}"`,
        item.icon ? `icon: "${item.icon}"` : "",
        !isLast && item.navigable ? `onClick: () => navigate("/rota/${index}")` : "",
      ]
        .filter(Boolean)
        .join(", ");
      return `    { ${props} }`;
    })
    .join(",\n");

  const homeProps = hasHome ? `\n  homeHref="${homeHref}"` : "";

  return `<BreadcrumbSeplag${homeProps}\n  items={[\n${itemsCode},\n  ]}\n/>`;
}

function BreadcrumbPlayground() {
  const [items, setItems] = useState<PlaygroundItemState[]>(DEFAULT_ITEMS);
  const [hasHome, setHasHome] = useState(true);
  const [homeHref, setHomeHref] = useState("/app");

  function updateItem(index: number, patch: Partial<PlaygroundItemState>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      createPlaygroundItem({ label: `Item ${current.length + 1}`, icon: "", navigable: false }),
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  const resolvedItems: BreadcrumbItemSeplag[] = items.map((item, index) => {
    const isLast = index === items.length - 1;
    return {
      label: item.label,
      icon: item.icon || undefined,
      onClick: !isLast && item.navigable ? () => undefined : undefined,
    };
  });

  const generatedCode = `import { BreadcrumbSeplag } from "@seplag/ui-lib-react-18";\n\n${itemsToPropsCode(items, hasHome, homeHref)}`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div className="botao-playground-preview">
        <BreadcrumbSeplag
          items={resolvedItems}
          homeHref={hasHome ? homeHref : undefined}
          onHomeClick={hasHome ? () => undefined : undefined}
        />
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        {/* Home */}
        <div className="pg-field">
          <span className="pg-label">ícone de casa (home)</span>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${hasHome ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={hasHome}
                onChange={(e) => setHasHome(e.target.checked)}
              />
              <span>exibir homeHref</span>
            </label>
          </div>
        </div>

        {hasHome && (
          <div className="pg-field">
            <label className="pg-label" htmlFor="pg-breadcrumb-home">
              homeHref
            </label>
            <input
              id="pg-breadcrumb-home"
              className="pg-input"
              type="text"
              value={homeHref}
              onChange={(e) => setHomeHref(e.target.value)}
              placeholder="/app"
            />
          </div>
        )}

        {/* Itens */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div
              key={item.id}
              className="pg-field"
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 10,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pg-label" style={{ margin: 0 }}>
                  {isLast ? `item ${index + 1} (atual)` : `item ${index + 1}`}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    className="pg-code-toggle"
                    onClick={() => removeItem(index)}
                  >
                    remover
                  </button>
                )}
              </div>

              <input
                className="pg-input"
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Label"
              />

              <select
                className="pg-select"
                value={item.icon}
                onChange={(e) => updateItem(index, { icon: e.target.value })}
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label || "Nenhum ícone"}
                  </option>
                ))}
              </select>

              {!isLast && (
                <label className={`pg-checkbox-btn${item.navigable ? " selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={item.navigable}
                    onChange={(e) => updateItem(index, { navigable: e.target.checked })}
                  />
                  <span>navegável (onClick)</span>
                </label>
              )}
            </div>
          );
        })}

        <button type="button" className="pg-code-toggle" onClick={addItem}>
          + adicionar item
        </button>
      </div>

      {/* Código gerado */}
      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Monte a trilha de navegação ao vivo: adicione/remova itens, ajuste labels, ícones e navegabilidade. O último item é sempre tratado como \"página atual\" (não navegável, estilo destacado). O código gerado é atualizado automaticamente.",
    example: <BreadcrumbPlayground />,
    code: "// Use o playground acima para gerar o código do seu breadcrumb",
  },
  {
    title: "Uso básico",
    description:
      "items é a lista de níveis da trilha. O último item da lista é sempre renderizado como a página atual — sem link, com destaque visual (aria-current=\"page\"). Os demais, quando têm href ou onClick, ficam clicáveis.",
    example: (
      <BreadcrumbSeplag
        items={[
          { label: "Cadastro", onClick: () => undefined },
          { label: "Instituição", onClick: () => undefined },
          { label: "Editar" },
        ]}
      />
    ),
    code: `<BreadcrumbSeplag
  items={[
    { label: "Cadastro", onClick: () => navigate("/app/cadastro") },
    { label: "Instituição", onClick: () => navigate("/app/cadastro/instituicao") },
    { label: "Editar" },
  ]}
/>`,
  },
  {
    title: "Com ícone de casa (home)",
    description:
      "homeHref ou onHomeClick exibem um ícone de casa clicável antes do primeiro item, normalmente levando à página inicial do sistema.",
    example: (
      <BreadcrumbSeplag
        homeHref="/app"
        onHomeClick={() => undefined}
        items={[
          { label: "Cadastro", onClick: () => undefined },
          { label: "Órgão Entidade" },
        ]}
      />
    ),
    code: `<BreadcrumbSeplag
  homeHref="/app"
  onHomeClick={() => navigate("/app")}
  items={[
    { label: "Cadastro", onClick: () => navigate("/app/cadastro") },
    { label: "Órgão Entidade" },
  ]}
/>`,
  },
  {
    title: "Ícones por item",
    description:
      "Cada item pode receber um icon (classe PrimeIcons). Por convenção, prefira usar o ícone apenas no item atual (o último) — os itens ancestrais mostram só o texto, mantendo a trilha limpa.",
    example: (
      <BreadcrumbSeplag
        items={[
          { label: "Cadastro", onClick: () => undefined },
          { label: "Estrutura Organizacional", onClick: () => undefined },
          { label: "Setor", icon: "pi pi-sitemap" },
        ]}
      />
    ),
    code: `<BreadcrumbSeplag
  items={[
    { label: "Cadastro", onClick: () => navigate("/app/cadastro") },
    { label: "Estrutura Organizacional", onClick: () => navigate("/app/cadastro/estrutura") },
    { label: "Setor", icon: "pi pi-sitemap" },
  ]}
/>`,
  },
  {
    title: "Item atual com texto longo",
    description:
      "O item atual (último) trunca automaticamente com reticências além de 40 caracteres (maxWidth + text-overflow), preservando o title (tooltip nativo) com o texto completo.",
    example: (
      <BreadcrumbSeplag
        items={[
          { label: "Cadastro", onClick: () => undefined },
          {
            label:
              "Secretaria de Estado de Planejamento e Gestão do Estado de Mato Grosso — Unidade Central",
          },
        ]}
      />
    ),
    code: `<BreadcrumbSeplag
  items={[
    { label: "Cadastro", onClick: () => navigate("/app/cadastro") },
    { label: "Secretaria de Estado de Planejamento e Gestão do Estado de Mato Grosso — Unidade Central" },
  ]}
/>`,
  },
  {
    title: "Breadcrumb automático via LayoutSeplag (recomendado)",
    description:
      "Na maioria dos sistemas, a trilha não é montada manualmente item a item — LayoutSeplag com showBreadcrumb faz isso sozinho, derivando os itens da árvore de menu (breadcrumbMenu) e da rota atual, via o hook useBreadcrumbFromMenuSeplag internamente. Pré-requisito obrigatório: o app precisa estar envolto por BreadcrumbCurrentProviderSeplag (uma vez, no main.tsx/entry-point) — sem ele, useSetBreadcrumbCurrentSeplag não tem efeito nenhum e o item atual sempre cai no texto inferido automaticamente.",
    example: null,
    code: `// main.tsx — envolve as rotas UMA VEZ, no entry-point da aplicação
import { BreadcrumbCurrentProviderSeplag } from "@seplag/ui-lib-react-18";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <BreadcrumbCurrentProviderSeplag>
      <App />
    </BreadcrumbCurrentProviderSeplag>
  </BrowserRouter>,
);

// Layout.tsx do sistema consumidor
import { LayoutSeplag } from "@seplag/ui-lib-react-18";
import { menuGlobal } from "../config/menu";

export function Layout() {
  return (
    <LayoutSeplag
      // ...demais props (currentSystem, menuItems, etc.)
      showBreadcrumb
      breadcrumbMenu={menuGlobal}
    />
  );
}`,
  },
  {
    title: "Como o breadcrumb automático deriva os labels",
    description:
      "useBreadcrumbFromMenuSeplag casa a rota atual (pathname) com a árvore de menu para montar os itens. Rotas de ação (new, edit/:id, view/:id, nv/:id) normalmente não têm label próprio no menu — nesses casos o texto do item atual segue esta ordem de prioridade: 1) current explícito passado ao hook, 2) contexto (useSetBreadcrumbCurrentSeplag), 3) padrão inferido da URL (/new → \"Cadastrar\", /edit → \"Editar\", /nv → \"Nova Versão\", /view ou fallback → \"Visualizar\"), 4) label da rota no menu.",
    example: null,
    code: `// menu.ts — rotas de ação (new/edit/view) tipicamente têm label: null
Route("INSTITUICAO", "Instituição", "/app/cadastro/instituicao", ListInstituicao, [...]),
Route("INSTITUICAO", null, "/app/cadastro/instituicao/new", CreateInstituicao, [...]),
Route("INSTITUICAO", null, "/app/cadastro/instituicao/edit/:id", EditInstituicao, [...]),
Route("INSTITUICAO", null, "/app/cadastro/instituicao/view/:id", ViewInstituicao, [...]),

// Resultado em /app/cadastro/instituicao/edit/42:
// Cadastro > Instituição > Editar
//   ^ ancestral        ^ listagem (siblingEntry, clicável, sem ícone)   ^ ação inferida do path`,
  },
  {
    title: "Nome personalizado no item atual (useSetBreadcrumbCurrentSeplag)",
    description:
      "Quando o texto inferido automaticamente (\"Cadastrar\"/\"Editar\"/\"Visualizar\") não é suficiente — por exemplo, você quer mostrar o nome do registro sendo editado — chame useSetBreadcrumbCurrentSeplag dentro da página. Isso sobrescreve só o item atual (o último da trilha); os ancestrais continuam vindo do menu. Depende do BreadcrumbCurrentProviderSeplag já estar configurado no main.tsx (ver seção anterior) — sem ele, esta chamada não tem nenhum efeito, silenciosamente.",
    example: null,
    code: `// EditInstituicao.tsx — dentro da página
import { useSetBreadcrumbCurrentSeplag } from "@seplag/ui-lib-react-18";

export function EditInstituicao() {
  const { data: instituicao } = useGetInstituicaoQuery(id);

  useSetBreadcrumbCurrentSeplag({
    label: instituicao ? \`Editar - \${instituicao.nome}\` : "Editar",
  });

  return /* ... */;
}

// Resultado: Cadastro > Instituição > Editar - Secretaria de Planejamento`,
  },
  {
    title: "Ancestral clicável de volta para a listagem",
    description:
      "Ancestrais derivados do menu (incluindo o item de listagem, quando a rota atual é uma ação irmã dela) recebem onClick automaticamente quando têm to definido no menu — clicar neles navega de volta para aquela rota, sem precisar de código adicional na página.",
    example: (
      <BreadcrumbSeplag
        items={[
          { label: "Cadastro", onClick: () => undefined },
          { label: "Estrutura Organizacional", onClick: () => undefined },
          { label: "Instituição", onClick: () => undefined },
          { label: "Cadastrar" },
        ]}
      />
    ),
    code: `// Clicar em "Instituição" navega para /app/cadastro/instituicao (a listagem),
// mesmo estando na tela de cadastro (.../instituicao/new).
// Isso já vem pronto do useBreadcrumbFromMenuSeplag — nada a fazer na página.`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "items",
    type: "BreadcrumbItemSeplag[]",
    required: true,
    description:
      "Lista dos níveis da trilha, do mais externo ao atual. O último item é sempre tratado como a página atual (sem link, com destaque visual). Cada item aceita: label (string), icon? (classe PrimeIcons), href? (renderiza como <a>) e onClick? (renderiza como <button>).",
  },
  {
    name: "homeHref",
    type: "string",
    required: false,
    description:
      "Quando informado (junto de onHomeClick, ou sozinho), exibe um ícone de casa clicável antes do primeiro item.",
  },
  {
    name: "onHomeClick",
    type: "() => void",
    required: false,
    description: "Callback do ícone de casa. Pode ser usado no lugar de/junto com homeHref.",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe CSS aplicada ao elemento <nav> raiz.",
  },
  {
    name: "style",
    type: "React.CSSProperties",
    required: false,
    description: "Estilo inline aplicado ao elemento <nav> raiz (mesclado com o estilo padrão).",
  },
];

export default function BreadcrumbDoc() {
  return (
    <DocPage
      title="Breadcrumb"
      description="Trilha de navegação (breadcrumb) com ícone de casa opcional, itens navegáveis e item atual destacado. Pode ser usado manualmente (BreadcrumbSeplag) ou montado automaticamente a partir do menu e da rota atual via LayoutSeplag + useBreadcrumbFromMenuSeplag — o padrão recomendado na maioria dos sistemas."
      badge="Estável"
      since="v0.0.1"
      importStatement={'import { BreadcrumbSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
