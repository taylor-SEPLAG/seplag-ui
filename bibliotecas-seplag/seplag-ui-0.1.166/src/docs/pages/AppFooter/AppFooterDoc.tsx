import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { AppFooterSeplag } from "@componentes/layout/AppFooter/AppFooter";

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Rodapé com texto simples via prop `text`.",
    example: <AppFooterSeplag text="© 2026 SEPLAG – MT. Todos os direitos reservados." />,
    code: `import { AppFooterSeplag } from "@seplag/ui-lib-react-18";

<AppFooterSeplag text="© 2026 SEPLAG – MT. Todos os direitos reservados." />`,
  },
  {
    title: "Com conteúdo customizado",
    description: "Passe qualquer elemento como `children` para substituir o texto padrão.",
    example: (
      <AppFooterSeplag>
        <span>
          <strong>SEPLAG</strong> &mdash; Secretaria de Estado de Planejamento e Gestão
          &nbsp;|&nbsp; v1.0.0
        </span>
      </AppFooterSeplag>
    ),
    code: `import { AppFooterSeplag } from "@seplag/ui-lib-react-18";

<AppFooterSeplag>
  <span>
    <strong>SEPLAG</strong> — Secretaria de Estado de Planejamento e Gestão | v1.0.0
  </span>
</AppFooterSeplag>`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "text",
    type: "string",
    description: "Texto exibido no rodapé. Ignorado quando `children` é fornecido.",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "Conteúdo personalizado do rodapé. Substitui o `text` quando presente.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppFooterDoc() {
  return (
    <DocPage
      title="AppFooter"
      description="Componente de rodapé do layout principal da aplicação. Exibe um texto de copyright ou conteúdo customizado via children."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { AppFooterSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
