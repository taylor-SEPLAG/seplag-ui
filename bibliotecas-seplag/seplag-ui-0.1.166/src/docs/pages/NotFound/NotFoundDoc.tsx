import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { NotFoundSeplag } from "@componentes/NotFound/NotFound";
import { useState } from "react";

// NotFoundSeplag usa useLocation/useNavigate internamente, então precisa estar dentro de um
// <Router> — esta própria página de docs já roda dentro do BrowserRouter do app de docs, então
// o componente é renderizado diretamente aqui (sem MemoryRouter: react-router não permite
// nenhum <Router> aninhado dentro de outro). Os botões "Voltar"/"Ir para o início" navegam de
// verdade dentro do app de docs — é o comportamento real do componente, não uma simulação.

function NotFoundPlayground() {
  const [sistemaLabel, setSistemaLabel] = useState("Governo do Estado de Mato Grosso · SIGEP");

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem", maxWidth: 480 }}>
        <label htmlFor="nf-label" style={{ fontWeight: 600 }}>
          sistemaLabel
        </label>
        <input
          id="nf-label"
          type="text"
          value={sistemaLabel}
          onChange={(e) => setSistemaLabel(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "0.5rem 0.75rem" }}
        />
      </div>
      <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 0 }}>
        A trilha de segmentos abaixo reflete o caminho real desta página de docs (componente
        renderizado ao vivo, dentro do router do app de docs). Os botões navegam de verdade.
      </p>

      {/*
        NotFound.module.css usa min-height: 100vh e elementos com position: absolute pensados
        para ocupar a tela inteira, como no uso real dentro do AppRouterSeplag — por isso o
        wrapper aqui não força nenhuma altura: o componente cresce até seu tamanho natural.
      */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}>
        <NotFoundSeplag homeRoute="/" sistemaLabel={sistemaLabel} />
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "NotFoundSeplag é uma página estática de erro cuja única interatividade real vem de useLocation/useNavigate do react-router — por isso é renderizado aqui diretamente dentro do router do app de docs (não é possível isolar um router próprio dentro desta página). Edite sistemaLabel para ver o rótulo institucional mudar ao vivo.",
    example: <NotFoundPlayground />,
    code: `import { NotFoundSeplag } from "@seplag/ui-lib-react-18";

// Tipicamente usado como notFound do AppRouterSeplag, ou diretamente
// como elemento de uma <Route path="*">:
<Route
  path="*"
  element={
    <NotFoundSeplag
      homeRoute="/app/bemvindo"
      sistemaLabel="Governo do Estado de Mato Grosso · SIGEP"
    />
  }
/>`,
  },
  {
    title: "Uso padrão (sem props)",
    description: "Sem customização, usa os textos institucionais padrão da SEPLAG e navega para \"/\" no botão de início.",
    example: (
      <div style={{ color: "#64748b" }}>
        Veja o Playground acima — os valores padrão de homeRoute, sistemaLabel e orgaoLabel aparecem ao limpar os campos.
      </div>
    ),
    code: `<NotFoundSeplag />`,
  },
];

const props: DocProp[] = [
  { name: "homeRoute", type: "string", defaultValue: '"/"', description: "Rota para onde o botão \"Ir para o início\" navega." },
  { name: "sistemaLabel", type: "string", defaultValue: '"Governo do Estado de Mato Grosso · SEPLAG"', description: "Nome do sistema exibido na barra superior do painel institucional lateral." },
  { name: "orgaoLabel", type: "string", defaultValue: "SEPLAG_NOME_ORGAO_SEPLAG", description: "Texto institucional exibido no rodapé do painel lateral." },
];

export default function NotFoundDoc() {
  return (
    <DocPage
      title="NotFound"
      badge="Estável"
      since="v0.1.153"
      description="Página padrão de erro 404, com painel institucional lateral e ações de navegação (voltar / ir para o início). Usada como notFound padrão do AppRouterSeplag. É essencialmente uma página estática de erro — sua única interação real é a navegação via react-router."
      importStatement={`import { NotFoundSeplag } from "@seplag/ui-lib-react-18";
import type { NotFoundSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
