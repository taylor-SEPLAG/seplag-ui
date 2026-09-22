import {
  BarraProporcionalSeplag,
  type BarraProporcionalSegmentoSeplag,
} from "@componentes/BarraProporcional";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

const segmentosExemplo: BarraProporcionalSegmentoSeplag[] = [
  {
    id: "concluidos",
    valor: 75,
    cor: "#16a34a",
    titulo: "75 registros concluídos",
  },
  {
    id: "erros",
    valor: 25,
    cor: "#dc2626",
    titulo: "25 registros com erro",
  },
];

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Informe os segmentos com seus valores e cores. A barra calcula a proporção de cada segmento pela soma dos valores recebidos.",
    example: (
      <div style={{ width: "100%", maxWidth: 720 }}>
        <BarraProporcionalSeplag
          segmentos={segmentosExemplo}
          ariaLabel="75 registros concluídos e 25 registros com erro"
        />
      </div>
    ),
    code: `import {
  BarraProporcionalSeplag,
  type BarraProporcionalSegmentoSeplag,
} from "@seplag/ui-lib-react-18";

const segmentos: BarraProporcionalSegmentoSeplag[] = [
  { id: "concluidos", valor: 75, cor: "#16a34a", titulo: "75 concluídos" },
  { id: "erros", valor: 25, cor: "#dc2626", titulo: "25 com erro" },
];

<BarraProporcionalSeplag
  segmentos={segmentos}
  ariaLabel="75 registros concluídos e 25 registros com erro"
/>;`,
  },
  {
    title: "Total maior que os segmentos",
    description:
      "Use total quando os segmentos representam apenas parte do conjunto. O espaço restante permanece com a cor de fundo da barra.",
    example: (
      <div style={{ width: "100%", maxWidth: 720 }}>
        <BarraProporcionalSeplag
          total={100}
          segmentos={[
            {
              id: "processados",
              valor: 60,
              cor: "#2563eb",
              titulo: "60 de 100 registros processados",
            },
          ]}
          ariaLabel="60 de 100 registros processados"
        />
      </div>
    ),
    code: `<BarraProporcionalSeplag
  total={100}
  segmentos={[
    { id: "processados", valor: 60, cor: "#2563eb", titulo: "60 processados" },
  ]}
  ariaLabel="60 de 100 registros processados"
/>`,
  },
  {
    title: "Aparência personalizada",
    description:
      "Altura, cor de fundo e classe CSS podem ser ajustadas pelo consumidor sem acrescentar regras de negócio ao componente.",
    example: (
      <div style={{ width: "100%", maxWidth: 720 }}>
        <BarraProporcionalSeplag
          total={120}
          altura="1.25rem"
          corFundo="#f1f5f9"
          segmentos={[
            { id: "aprovados", valor: 80, cor: "#0f766e", titulo: "80 aprovados" },
            { id: "pendentes", valor: 25, cor: "#f59e0b", titulo: "25 pendentes" },
            { id: "reprovados", valor: 15, cor: "#b91c1c", titulo: "15 reprovados" },
          ]}
          ariaLabel="Distribuição entre aprovados, pendentes e reprovados"
        />
      </div>
    ),
    code: `<BarraProporcionalSeplag
  total={120}
  altura="1.25rem"
  corFundo="#f1f5f9"
  segmentos={[
    { id: "aprovados", valor: 80, cor: "#0f766e" },
    { id: "pendentes", valor: 25, cor: "#f59e0b" },
    { id: "reprovados", valor: 15, cor: "#b91c1c" },
  ]}
  ariaLabel="Distribuição entre aprovados, pendentes e reprovados"
/>`,
  },
  {
    title: "Sem valores válidos",
    description:
      "Valores iguais ou menores que zero, infinitos e NaN são ignorados. Sem segmentos válidos, somente o fundo da barra é apresentado.",
    example: (
      <div style={{ width: "100%", maxWidth: 720 }}>
        <BarraProporcionalSeplag
          segmentos={[
            { id: "zerado", valor: 0, cor: "#2563eb" },
            { id: "invalido", valor: Number.NaN, cor: "#dc2626" },
          ]}
          ariaLabel="Nenhum valor disponível para distribuição"
        />
      </div>
    ),
    code: `<BarraProporcionalSeplag
  segmentos={[
    { id: "zerado", valor: 0, cor: "#2563eb" },
    { id: "invalido", valor: Number.NaN, cor: "#dc2626" },
  ]}
  ariaLabel="Nenhum valor disponível para distribuição"
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "segmentos",
    type: "readonly BarraProporcionalSegmentoSeplag[]",
    required: true,
    description: "Segmentos apresentados na ordem recebida.",
  },
  {
    name: "total",
    type: "number",
    description:
      "Base opcional para o cálculo das proporções. Quando menor que a soma dos segmentos, a soma prevalece.",
  },
  {
    name: "altura",
    type: "CSSProperties[\"height\"]",
    defaultValue: '"0.75rem"',
    description: "Altura aplicada ao elemento raiz da barra.",
  },
  {
    name: "corFundo",
    type: "string",
    defaultValue: '"#e5e7eb"',
    description: "Cor da barra vazia e da parcela não representada por segmentos.",
  },
  {
    name: "className",
    type: "string",
    description: "Classe CSS adicional aplicada ao elemento raiz.",
  },
  {
    name: "ariaLabel",
    type: "string",
    defaultValue: '"Distribuição proporcional"',
    description:
      "Descrição acessível da distribuição. Informe um texto que comunique os valores relevantes.",
  },
  {
    name: "segmentos[].id",
    type: "string | number",
    required: true,
    description: "Identificador único usado como chave do segmento.",
  },
  {
    name: "segmentos[].valor",
    type: "number",
    required: true,
    description: "Valor numérico usado no cálculo proporcional.",
  },
  {
    name: "segmentos[].cor",
    type: "string",
    required: true,
    description: "Cor CSS aplicada ao segmento.",
  },
  {
    name: "segmentos[].titulo",
    type: "string",
    description: "Texto opcional apresentado como tooltip nativo do segmento.",
  },
];

export default function BarraProporcionalDoc() {
  return (
    <DocPage
      title="BarraProporcionalSeplag"
      description="Representa valores por meio de segmentos coloridos proporcionais. É um componente puramente apresentacional: o consumidor define valores, cores e textos acessíveis, sem acoplamento a APIs ou regras de negócio."
      badge="Estável"
      since="v0.1.123"
      importStatement={`import { BarraProporcionalSeplag } from "@seplag/ui-lib-react-18";
import type { BarraProporcionalSegmentoSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
