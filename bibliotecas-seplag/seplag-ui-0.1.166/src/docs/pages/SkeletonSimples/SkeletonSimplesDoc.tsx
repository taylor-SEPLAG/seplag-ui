import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { SkeletonSimplesSeplag } from "@componentes/SkeletonSimples";
import { useState } from "react";

function SkeletonSimplesPlayground() {
  const [carregado, setCarregado] = useState(false);
  const [linhas, setLinhas] = useState(3);

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input type="checkbox" checked={carregado} onChange={(e) => setCarregado(e.target.checked)} />
          Dados carregados
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          Linhas:
          <input
            type="number"
            min={1}
            max={6}
            value={linhas}
            onChange={(e) => setLinhas(Number(e.target.value) || 1)}
            style={{ width: 60, border: "1px solid #cbd5e1", borderRadius: 6, padding: "0.25rem 0.5rem" }}
          />
        </label>
      </div>

      {carregado
        ? Array.from({ length: linhas }).map((_, i) => (
            <p key={i} style={{ margin: "0 0 0.5rem" }}>
              Linha de conteúdo carregada #{i + 1}
            </p>
          ))
        : Array.from({ length: linhas }).map((_, i) => <SkeletonSimplesSeplag key={i} />)}
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Alterne entre o estado de carregamento (skeletons) e o conteúdo real, e ajuste a quantidade de linhas.",
    example: <SkeletonSimplesPlayground />,
    code: `import { useState } from "react";
import { SkeletonSimplesSeplag } from "@seplag/ui-lib-react-18";

const [carregado, setCarregado] = useState(false);

{carregado
  ? dados.map((item) => <p key={item.id}>{item.texto}</p>)
  : Array.from({ length: 3 }).map((_, i) => <SkeletonSimplesSeplag key={i} />)}`,
  },
  {
    title: "Altura e largura customizadas",
    description: "Aceita todas as props do Skeleton do PrimeReact (width, height, shape, borderRadius etc.), com height padronizado em 35px.",
    example: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 320 }}>
        <SkeletonSimplesSeplag width="60%" />
        <SkeletonSimplesSeplag width="100%" />
        <SkeletonSimplesSeplag width="40%" height="20px" />
        <SkeletonSimplesSeplag shape="circle" width="48px" height="48px" />
      </div>
    ),
    code: `<SkeletonSimplesSeplag width="60%" />
<SkeletonSimplesSeplag width="100%" />
<SkeletonSimplesSeplag width="40%" height="20px" />
<SkeletonSimplesSeplag shape="circle" width="48px" height="48px" />`,
  },
];

const props: DocProp[] = [
  { name: "height", type: "string", defaultValue: '"35px"', description: "Altura do skeleton. Sobrescreve o padrão do PrimeReact." },
  {
    name: "...props",
    type: "SkeletonProps (primereact/skeleton)",
    description:
      'Demais props do componente Skeleton do PrimeReact são repassadas diretamente (width, shape, borderRadius, animation etc.). A classe "mb-2" é sempre aplicada além das classes informadas.',
  },
];

export default function SkeletonSimplesDoc() {
  return (
    <DocPage
      title="SkeletonSimples"
      badge="Estável"
      since="v0.1.153"
      description="Fino wrapper sobre o Skeleton do PrimeReact, com altura padrão (35px) e margem inferior (mb-2) já aplicadas — evita repetir esses ajustes em cada tela."
      importStatement={`import { SkeletonSimplesSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
