import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { AccordionCardSeplag } from "@componentes/AccordionCard";
import { BotaoSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

function AccordionCardPlayground() {
  const [title, setTitle] = useState("Título do card");
  const [isOpen, setIsOpen] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [id, setId] = useState("card-1");
  const [iconTitulo, setIconTitulo] = useState("pi pi-users");
  const [headerRightEnabled, setHeaderRightEnabled] = useState(false);
  const [className, setClassName] = useState("");
  const [headerClassName, setHeaderClassName] = useState("");
  const [content, setContent] = useState("Conteúdo de exemplo do AccordionCard.");
  const [transitionDuration, setTransitionDuration] = useState(300);
  const [transitionEasing, setTransitionEasing] = useState("ease");

  const propsSnippet = [
    id ? `id="${id}"` : null,
    title ? `title="${title}"` : null,
    isOpen ? `isOpen={true}` : `isOpen={false}`,
    showIcon ? `showIcon` : null,
    iconTitulo ? `iconTitulo="${iconTitulo}"` : null,
    className ? `className="${className}"` : null,
    headerClassName ? `headerClassName="${headerClassName}"` : null,
    headerRightEnabled ? `headerRight={<button>Acao</button>}` : null,
    transitionDuration !== 300 ? `transitionDuration={${transitionDuration}}` : null,
    transitionEasing !== "ease" ? `transitionEasing="${transitionEasing}"` : null,
  ]
    .filter(Boolean)
    .join("\n  ");

  const propsBlock = propsSnippet ? `\n  ${propsSnippet}\n` : "";

  const generatedCode = `import { AccordionCardSeplag } from "@seplag/ui-lib-react-18";\n\n<AccordionCardSeplag${propsBlock}>\n  <div style={{ padding: 8 }}>${content}</div>\n</AccordionCardSeplag>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <AccordionCardSeplag
          id={id}
          title={title}
          isOpen={isOpen}
          showIcon={showIcon}
          iconTitulo={iconTitulo}
          className={className || undefined}
          headerClassName={headerClassName || undefined}
          headerRight={
            headerRightEnabled ? <BotaoSeplag icon="pi pi-plus" tooltip="Ação" /> : undefined
          }
          onToggle={() => setIsOpen((v) => !v)}
          transitionDuration={transitionDuration}
          transitionEasing={transitionEasing}
        >
          <div style={{ padding: 8 }}>{content}</div>
        </AccordionCardSeplag>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="ac-id" className="pg-label">
            id
          </label>
          <input
            id="ac-id"
            className="pg-input"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-title" className="pg-label">
            title
          </label>
          <input
            id="ac-title"
            className="pg-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label className="pg-label">isOpen</label>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${isOpen ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
              />
              aberto
            </label>
          </div>
        </div>

        <div className="pg-field">
          <label className="pg-label">showIcon</label>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${showIcon ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={showIcon}
                onChange={(e) => setShowIcon(e.target.checked)}
              />
              mostrar ícone
            </label>
          </div>
        </div>

        <div className="pg-field">
          <label htmlFor="ac-icon" className="pg-label">
            iconTitulo
          </label>
          <input
            id="ac-icon"
            className="pg-input"
            value={iconTitulo}
            onChange={(e) => setIconTitulo(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-class" className="pg-label">
            className
          </label>
          <input
            id="ac-class"
            className="pg-input"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-header-class" className="pg-label">
            headerClassName
          </label>
          <input
            id="ac-header-class"
            className="pg-input"
            value={headerClassName}
            onChange={(e) => setHeaderClassName(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-content" className="pg-label">
            children (conteúdo)
          </label>
          <input
            id="ac-content"
            className="pg-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-duration" className="pg-label">
            transitionDuration (ms)
          </label>
          <input
            id="ac-duration"
            className="pg-input"
            type="number"
            min={0}
            max={2000}
            step={50}
            value={transitionDuration}
            onChange={(e) => setTransitionDuration(Number(e.target.value))}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="ac-easing" className="pg-label">
            transitionEasing
          </label>
          <select
            id="ac-easing"
            className="pg-input"
            value={transitionEasing}
            onChange={(e) => setTransitionEasing(e.target.value)}
          >
            <option value="ease">ease (padrão)</option>
            <option value="ease-in">ease-in</option>
            <option value="ease-out">ease-out</option>
            <option value="ease-in-out">ease-in-out</option>
            <option value="linear">linear</option>
            <option value="cubic-bezier(0.34,1.56,0.64,1)">spring (bounce)</option>
          </select>
        </div>

        <div className="pg-field">
          <label className="pg-label">headerRight</label>
          <div className="pg-checkbox-group">
            <label className={`pg-checkbox-btn${headerRightEnabled ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={headerRightEnabled}
                onChange={(e) => setHeaderRightEnabled(e.target.checked)}
              />
              botão de ação
            </label>
          </div>
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

function TransitionExample({
  title,
  duration,
  easing,
  content,
}: {
  title: string;
  duration?: number;
  easing?: string;
  content: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <AccordionCardSeplag
      title={title}
      isOpen={open}
      showIcon
      onToggle={() => setOpen((v) => !v)}
      transitionDuration={duration}
      transitionEasing={easing}
    >
      <div style={{ padding: 8 }}>{content}</div>
    </AccordionCardSeplag>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Interaja com as props do AccordionCard e copie o código gerado.",
    example: <AccordionCardPlayground />,
    code: "// Use o playground acima para gerar o código do AccordionCard",
  },
  {
    title: "Exemplo simples",
    description: "Uso controlado do AccordionCard (isOpen + onToggle).",
    example: (
      <AccordionCardSeplag title="Exemplo" isOpen={true} showIcon>
        <div style={{ padding: 8 }}>Conteúdo dentro do card</div>
      </AccordionCardSeplag>
    ),
    code: `import { AccordionCardSeplag } from "@seplag/ui-lib-react-18";

<AccordionCardSeplag title="Exemplo" isOpen={true} showIcon>
  <div>Conteúdo dentro do card</div>
</AccordionCardSeplag>`,
  },
  {
    title: "Exemplos de transição",
    description:
      "Use transitionDuration (ms) e transitionEasing para personalizar a animação de abrir/fechar. O padrão é 300ms ease.",
    example: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TransitionExample title="Padrão — 300ms ease" content="Animação padrão." />
        <TransitionExample
          title="Rápido — 150ms ease-out"
          duration={150}
          easing="ease-out"
          content="Abre e fecha mais rápido."
        />
        <TransitionExample
          title="Lento — 600ms ease-in-out"
          duration={600}
          easing="ease-in-out"
          content="Animação suave e lenta."
        />
        <TransitionExample
          title="Spring — 500ms cubic-bezier"
          duration={500}
          easing="cubic-bezier(0.34,1.56,0.64,1)"
          content="Efeito de mola ao abrir."
        />
        <TransitionExample
          title="Sem animação — 0ms"
          duration={0}
          content="Abre e fecha instantaneamente."
        />
      </div>
    ),
    code: `// Padrão
<AccordionCardSeplag title="Padrão" isOpen={isOpen} showIcon onToggle={toggle}>
  {/* conteúdo */}
</AccordionCardSeplag>

// Rápido
<AccordionCardSeplag transitionDuration={150} transitionEasing="ease-out" ...>
  {/* conteúdo */}
</AccordionCardSeplag>

// Lento
<AccordionCardSeplag transitionDuration={600} transitionEasing="ease-in-out" ...>
  {/* conteúdo */}
</AccordionCardSeplag>

// Spring (bounce)
<AccordionCardSeplag transitionDuration={500} transitionEasing="cubic-bezier(0.34,1.56,0.64,1)" ...>
  {/* conteúdo */}
</AccordionCardSeplag>

// Sem animação
<AccordionCardSeplag transitionDuration={0} ...>
  {/* conteúdo */}
</AccordionCardSeplag>`,
  },
];

const props: DocProp[] = [
  {
    name: "title",
    type: "string",
    required: false,
    description: "Título exibido no cabeçalho.",
  },
  {
    name: "id",
    type: "number | string",
    required: false,
    description: "ID opcional usado no atributo id do wrapper.",
  },
  {
    name: "isOpen",
    type: "boolean",
    required: true,
    description: "Controla se o conteúdo está visível (componente controlado).",
  },
  {
    name: "iconTitulo",
    type: "string",
    required: false,
    description: "Classe de ícone para exibir no cabeçalho.",
  },
  {
    name: "showIcon",
    type: "boolean",
    required: false,
    description: "Exibe o botão/ícone de colapso no cabeçalho.",
  },
  {
    name: "onToggle",
    type: "() => void",
    required: false,
    description: "Callback chamado ao alternar (ex.: para controlar isOpen).",
  },
  {
    name: "toggleElement",
    type: "React.ReactNode",
    required: false,
    description: "Elemento customizado para o toggle (substitui o padrão).",
  },
  {
    name: "headerRight",
    type: "React.ReactNode",
    required: false,
    description: "Conteúdo renderizado à direita do cabeçalho.",
  },
  {
    name: "children",
    type: "React.ReactNode",
    required: false,
    description: "Conteúdo exibido quando aberto.",
  },
  {
    name: "contentStyle",
    type: "React.CSSProperties",
    required: false,
    description: "Estilos inline para a área de conteúdo.",
  },
  {
    name: "containerStyle",
    type: "React.CSSProperties",
    required: false,
    description: "Estilos inline para o container do card.",
  },
  {
    name: "headerStyle",
    type: "React.CSSProperties",
    required: false,
    description: "Estilos inline para o texto do cabeçalho.",
  },
  {
    name: "transitionDuration",
    type: "number",
    required: false,
    description: "Duração da animação de abrir/fechar em milissegundos. Padrão: 300.",
  },
  {
    name: "transitionEasing",
    type: "string",
    required: false,
    description: 'Função de easing da animação (qualquer valor CSS válido). Padrão: "ease".',
  },
];

export default function AccordionCardDoc() {
  return (
    <DocPage
      title="AccordionCardSeplag"
      description="Componente card com cabeçalho e área colapsável, usado para agrupamento simples de conteúdo."
      importStatement={`import { AccordionCardSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
